import Link from "next/link";
import { BILLING_MERCHANT } from "@/lib/data/legal";
import { LegalSectionHeading } from "./LegalSectionHeading";

/**
 * Employer plan refund policy (1B): generally non-refundable B2B periods with
 * mandatory-law, billing-error, and limited goodwill exceptions. Not a 30-day MBG.
 */
export function RefundPolicyContent() {
  return (
    <article className="min-w-0 space-y-8 text-base leading-relaxed text-slate-600 sm:text-[17px]">
      <p>
        This Refund Policy applies to{" "}
        <strong className="font-semibold text-slate-800">
          Employer subscription plans
        </strong>{" "}
        (Discovery is free; paid Starter, Growth, and Scale tiers). It does{" "}
        <strong className="font-semibold text-slate-800">not</strong> cover
        worker payroll or off-platform payments between Employers and Workers.
        The merchant of record for paid plans is an Australian business
        operating {BILLING_MERCHANT.displayName}, with fees billed in{" "}
        {BILLING_MERCHANT.billingCurrency} through Stripe.
      </p>

      <LegalSectionHeading id="1-summary" number={1} title="Summary" />
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Paid plan periods that have started (monthly or{" "}
          <strong className="font-semibold text-slate-800">annual prepaid</strong>
          ) are generally{" "}
          <strong className="font-semibold text-slate-800">non-refundable</strong>{" "}
          for business subscriptions.
        </li>
        <li>
          We refund or credit verified{" "}
          <strong className="font-semibold text-slate-800">billing errors</strong>{" "}
          (duplicate charges, wrong plan).
        </li>
        <li>
          Mandatory consumer or other non-waivable law may require a different
          outcome for qualifying individual consumers (including under the
          Australian Consumer Law where it applies).
        </li>
        <li>
          Cancel anytime online — you keep paid access until the end of the
          current billing period (month or prepaid year). Canceling does not by
          itself create a partial refund for unused days.
        </li>
      </ul>

      <LegalSectionHeading
        id="2-when-we-refund"
        number={2}
        title="When we refund or credit"
      />
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong className="font-semibold text-slate-800">Billing errors:</strong>{" "}
          Duplicate charges or an incorrect plan billed — contact{" "}
          <a
            href={`mailto:${BILLING_MERCHANT.supportEmail}`}
            className="font-semibold text-[#006e2f] hover:underline"
          >
            {BILLING_MERCHANT.supportEmail}
          </a>{" "}
          with your invoice or Stripe receipt ID.
        </li>
        <li>
          <strong className="font-semibold text-slate-800">
            Platform fault / goodwill:
          </strong>{" "}
          If paid access was materially unavailable due to a Replaceme fault, we
          may issue a pro-rata credit or limited first-cycle goodwill refund at
          our discretion.
        </li>
        <li>
          <strong className="font-semibold text-slate-800">
            Termination without cause:
          </strong>{" "}
          If we terminate your account without cause before a paid period ends,
          we may issue a pro-rata credit or refund as required by law or at our
          discretion.
        </li>
        <li>
          <strong className="font-semibold text-slate-800">Mandatory law:</strong>{" "}
          Nothing in this Policy limits remedies that cannot be waived under
          Australian Consumer Law, Philippine consumer rules, or other mandatory
          protections that apply to you.
        </li>
      </ul>

      <LegalSectionHeading
        id="3-when-we-do-not"
        number={3}
        title="When we generally do not refund"
      />
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Unused time after you voluntarily cancel or downgrade mid-cycle
          (downgrades take effect at period end; you keep current entitlements
          until then).
        </li>
        <li>
          Dissatisfaction with hiring outcomes (for example, not finding a
          Worker). Paid plans buy Platform access and tools — not a placement
          guarantee. We do not offer a blanket “money-back if you don’t hire”
          guarantee.
        </li>
        <li>
          Change of mind after you have used paid messaging, profile unlocks, or
          other paid entitlements in that period, except where mandatory law
          requires otherwise.
        </li>
      </ul>

      <LegalSectionHeading
        id="4-how-to-request"
        number={4}
        title="How to request a refund"
      />
      <p>
        Email{" "}
        <a
          href={`mailto:${BILLING_MERCHANT.supportEmail}`}
          className="font-semibold text-[#006e2f] hover:underline"
        >
          {BILLING_MERCHANT.supportEmail}
        </a>{" "}
        with subject &quot;Billing Dispute / Refund Request,&quot; your account
        email, invoice or Stripe receipt ID, amount, and a short description.
        Approved refunds are issued through Stripe to the original payment
        method; timing depends on your bank or card network.
      </p>

      <LegalSectionHeading
        id="5-chargebacks"
        number={5}
        title="Chargebacks & card disputes"
      />
      <p>
        Please contact us first so we can correct billing errors without
        interrupting your hiring workflow. Card-network chargebacks remain
        available under network rules and applicable law. Fraudulent or
        bad-faith disputes after receiving paid access may lead to account
        suspension under our{" "}
        <Link
          href="/terms-of-service#65-refunds-chargebacks"
          className="font-semibold text-[#006e2f] hover:underline"
        >
          Terms of Service §6.5
        </Link>
        .
      </p>

      <LegalSectionHeading id="6-taxes" number={6} title="Tax on refunds" />
      <p>
        If your original charge included government tax collected via Stripe Tax
        (for example Australian GST), any approved refund generally includes the
        corresponding tax portion. Stripe processing fees are separate from tax
        and are governed by Stripe&apos;s terms.
      </p>

      <LegalSectionHeading id="7-related" number={7} title="Related documents" />
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <Link
            href="/terms-of-service#6-payments"
            className="font-semibold text-[#006e2f] hover:underline"
          >
            Terms of Service — Billing
          </Link>
        </li>
        <li>
          <Link
            href="/help/employer/billing-subscriptions"
            className="font-semibold text-[#006e2f] hover:underline"
          >
            Employer Billing &amp; Subscriptions Guide
          </Link>
        </li>
        <li>
          <Link
            href="/pricing"
            className="font-semibold text-[#006e2f] hover:underline"
          >
            Pricing
          </Link>
        </li>
      </ul>
    </article>
  );
}
