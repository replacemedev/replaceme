import type Stripe from "stripe";
import { requireStripe } from "@/lib/server/stripe/client";
import { createAdminClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";

const PAID_SLUGS = new Set(["starter", "growth", "scale"]);

type PortalProduct = {
  product: string;
  prices: string[];
};

/**
 * Ensure the Stripe Customer Portal can confirm plan switches.
 * `subscription_update_confirm` fails when features.subscription_update.enabled
 * is false or the target price/product is missing from the portal catalog.
 *
 * @see https://docs.stripe.com/customer-management/configure-portal
 * @see https://docs.stripe.com/api/customer_portal/configurations/update
 */
export async function ensurePortalPlanChangeConfiguration(): Promise<
  { configurationId: string } | { error: string }
> {
  const stripe = requireStripe();

  try {
    const products = await resolvePortalProducts(stripe);
    if (products.length === 0) {
      return {
        error:
          "No paid Stripe products/prices found for portal plan switching. Sync billing_plans stripe IDs first.",
      };
    }

    const listed = await stripe.billingPortal.configurations.list({
      active: true,
      limit: 10,
    });
    const defaultConfig =
      listed.data.find((c) => c.is_default) ?? listed.data[0] ?? null;

    if (!defaultConfig) {
      const created = await stripe.billingPortal.configurations.create({
        business_profile: {
          headline: "Manage your Replaceme subscription",
        },
        features: portalFeatures(products),
      });
      safeLog(`[Billing] Created portal config ${created.id} with plan switching`);
      return { configurationId: created.id };
    }

    const update = defaultConfig.features.subscription_update;
    const catalogOk = portalCatalogCovers(update?.products, products);
    const cancelMode =
      defaultConfig.features.subscription_cancel?.mode ?? null;
    const needsUpdate =
      !update?.enabled ||
      !(update.default_allowed_updates ?? []).includes("price") ||
      !catalogOk ||
      !hasPeriodEndDowngradeScheduling(update) ||
      update.proration_behavior !== "always_invoice" ||
      cancelMode !== "at_period_end";

    if (!needsUpdate) {
      return { configurationId: defaultConfig.id };
    }

    const updated = await stripe.billingPortal.configurations.update(
      defaultConfig.id,
      {
        features: portalFeatures(products),
      }
    );

    safeLog(
      `[Billing] Portal config ${updated.id}: upgrades immediate, downgrades at period end (${products.length} products)`
    );
    return { configurationId: updated.id };
  } catch (err) {
    safeError("[Billing] ensurePortalPlanChangeConfiguration failed", err);
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message?: string }).message)
        : "";
    return {
      error:
        message && message.length < 200
          ? message
          : "Could not enable Stripe Customer Portal plan switching.",
    };
  }
}

/**
 * Hybrid SaaS billing (Stripe + industry norm):
 * - Upgrades: immediate + always_invoice prorations
 * - Downgrades: schedule_at_period_end (decreasing_item_amount)
 * - Cancel: at_period_end (already)
 *
 * @see https://docs.stripe.com/changelog/acacia/2024-10-28/customer-portal-schedule-downgrades
 */
function portalFeatures(
  products: PortalProduct[]
): Stripe.BillingPortal.ConfigurationCreateParams.Features {
  return {
    customer_update: {
      enabled: true,
      allowed_updates: ["email", "name", "address", "phone"],
    },
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: {
      enabled: true,
      mode: "at_period_end",
      proration_behavior: "none",
    },
    subscription_update: {
      enabled: true,
      default_allowed_updates: ["price"],
      proration_behavior: "always_invoice",
      schedule_at_period_end: {
        conditions: [
          { type: "decreasing_item_amount" },
          { type: "shortening_interval" },
        ],
      },
      products,
    },
  };
}

function hasPeriodEndDowngradeScheduling(
  update:
    | Stripe.BillingPortal.Configuration.Features.SubscriptionUpdate
    | null
    | undefined
): boolean {
  const conditions = update?.schedule_at_period_end?.conditions ?? [];
  return conditions.some((c) => c.type === "decreasing_item_amount");
}

function portalCatalogCovers(
  current: Stripe.BillingPortal.Configuration.Features.SubscriptionUpdate.Product[] | null | undefined,
  required: PortalProduct[]
): boolean {
  if (!current || current.length === 0) return false;
  const byProduct = new Map(
    current.map((p) => [
      p.product,
      new Set((p.prices ?? []).filter(Boolean)),
    ])
  );
  return required.every((need) => {
    const prices = byProduct.get(need.product);
    if (!prices) return false;
    return need.prices.every((priceId) => prices.has(priceId));
  });
}

async function resolvePortalProducts(
  stripe: Stripe
): Promise<PortalProduct[]> {
  const byProduct = new Map<string, Set<string>>();

  const supabase = await createAdminClient();
  const { data: plans } = await supabase
    .from("billing_plans")
    .select("slug, stripe_price_id, stripe_product_id")
    .in("slug", [...PAID_SLUGS]);

  for (const plan of plans ?? []) {
    const priceId = plan.stripe_price_id?.trim();
    if (!priceId) continue;
    try {
      const price = await stripe.prices.retrieve(priceId);
      if (!price.active || !price.recurring) continue;
      const productId =
        plan.stripe_product_id?.trim() ||
        (typeof price.product === "string" ? price.product : price.product.id);
      if (!byProduct.has(productId)) byProduct.set(productId, new Set());
      byProduct.get(productId)!.add(price.id);
    } catch (err) {
      safeError("[Billing] portal product resolve failed for plan price", {
        priceId,
        err,
      });
    }
  }

  // Fallback: discover Replaceme recurring products from Stripe catalog
  if (byProduct.size === 0) {
    const products = await stripe.products.list({ active: true, limit: 50 });
    for (const product of products.data) {
      if (!/replace\s*me|starter|growth|scale/i.test(product.name)) continue;
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        type: "recurring",
        limit: 20,
      });
      if (prices.data.length === 0) continue;
      if (!byProduct.has(product.id)) byProduct.set(product.id, new Set());
      for (const price of prices.data) {
        byProduct.get(product.id)!.add(price.id);
      }
    }
  }

  return [...byProduct.entries()].map(([product, prices]) => ({
    product,
    prices: [...prices],
  }));
}
