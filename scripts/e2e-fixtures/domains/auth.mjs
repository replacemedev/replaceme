import { PERSONAS } from "../manifest.mjs";
import { ensureAuthUser, formatAuthError, getPassword } from "../shared.mjs";

export async function seedAuth(supabase, ctx) {
  console.log("[seed:e2e] auth — creating users via Admin API");

  for (const worker of PERSONAS.workers) {
    const id = await ensureAuthUser(supabase, {
      id: worker.id,
      email: worker.email,
      password: getPassword(worker.passwordEnv),
      role: "worker",
      firstName: worker.firstName,
      lastName: worker.lastName,
      username: worker.username,
    });
    ctx.userIds[worker.email] = id;
  }

  for (const filler of PERSONAS.fillerWorkers) {
    const email = `e2e-filler-${filler.suffix}@replaceme.test`;
    const id = await ensureAuthUser(supabase, {
      id: filler.id,
      email,
      password: getPassword("E2E_WORKER_1_PASSWORD"),
      role: "worker",
      firstName: "Filler",
      lastName: `Applicant ${filler.suffix}`,
      username: `e2e_filler_${filler.suffix}`,
    });
    ctx.userIds[email] = id;
  }

  for (const employer of PERSONAS.employers) {
    // Auth signup trigger + subscription guard reject direct employer creates
    // when discovery plan_id is provisioned (pricing v2). Seed as worker, then promote.
    const id = await ensureAuthUser(supabase, {
      id: employer.id,
      email: employer.email,
      password: getPassword(employer.passwordEnv),
      role: "worker",
      firstName: employer.companyName,
      lastName: "E2E",
      username: `${employer.username}_pending`,
    });
    const password = getPassword(employer.passwordEnv);
    const { error: promoteError } = await supabase.auth.admin.updateUserById(id, {
      email: employer.email,
      password,
      email_confirm: true,
      app_metadata: {
        provider: "email",
        providers: ["email"],
        role: "employer",
      },
      user_metadata: {
        first_name: employer.companyName,
        last_name: "E2E",
        username: employer.username,
        role: "employer",
      },
    });
    if (promoteError) {
      throw new Error(
        `employer promote failed (${employer.email}): ${formatAuthError(promoteError)}`
      );
    }
    ctx.userIds[employer.email] = id;
  }

  for (const admin of PERSONAS.admins) {
    const id = await ensureAuthUser(supabase, {
      id: admin.id,
      email: admin.email,
      password: getPassword(admin.passwordEnv),
      role: "admin",
      firstName: admin.firstName,
      lastName: admin.lastName,
      username: admin.username,
    });
    ctx.userIds[admin.email] = id;
  }
}
