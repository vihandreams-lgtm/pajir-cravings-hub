import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { maskEmail } from "@/lib/admin-access";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function assertAdmin(context: {
  userId: string;
  supabase: {
    rpc: (
      fn: "has_role",
      args: { _user_id: string; _role: "admin" | "user" },
    ) => PromiseLike<{ data: unknown }>;
  };
}) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (data !== true) throw new Error("Only the owner can manage who has access");
}

/**
 * Creates a ready-to-use manager account. There is no public sign-up anywhere:
 * the owner hands out access from inside the admin panel, and the new account
 * can sign in immediately without an email confirmation step.
 */
export const createStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; password: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);

    const email = data.email.trim().toLowerCase();
    if (!EMAIL.test(email)) throw new Error("Enter a valid email address");
    if (data.password.length < 8) throw new Error("Password must be at least 8 characters");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
    });
    if (error || !created.user) throw new Error(error?.message ?? "That account could not be created");

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "admin" });

    if (roleError) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error("The account was created but access could not be granted");
    }

    return { ok: true, email };
  });

/** Who currently holds kitchen-manager access, with emails partly hidden. */
export const listStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roles, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "admin");
    if (error) throw new Error(error.message);

    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const emails = new Map((users?.users ?? []).map((u) => [u.id, u.email ?? "unknown"]));

    return (roles ?? []).map((r) => ({
      user_id: r.user_id,
      email: maskEmail(emails.get(r.user_id) ?? "unknown"),
      is_self: r.user_id === context.userId,
    }));
  });
