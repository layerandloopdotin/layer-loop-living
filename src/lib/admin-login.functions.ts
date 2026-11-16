import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { adminLoginSchema, ADMIN_DOMAIN, toAdminEmail, toAdminPassword } from "@/lib/admin-login";

/** Finds the separate username/password admin account (email on the shop domain). */
async function findLoginAccount() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "admin");
  for (const r of roles ?? []) {
    const { data } = await supabaseAdmin.auth.admin.getUserById(r.user_id);
    if (data.user?.email?.endsWith(`@${ADMIN_DOMAIN}`)) return { supabaseAdmin, user: data.user };
  }
  return { supabaseAdmin, user: null };
}

async function assertAdmin(supabase: { rpc: (fn: "has_role", a: { _user_id: string; _role: "admin" }) => PromiseLike<{ data: boolean | null }> }, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Only admins can change the admin login");
}

export const getAdminLogin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { user } = await findLoginAccount();
    return { username: user?.email?.split("@")[0] ?? null };
  });

/** Only the shop owner's own account may reset the separate admin login. */
const OWNER_EMAIL = "swapnilrathoreswapnil@gmail.com";

export const setAdminLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => adminLoginSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin, user } = await findLoginAccount();
    if (!user) throw new Error("No separate admin login exists");
    const caller = (await supabaseAdmin.auth.admin.getUserById(context.userId)).data.user;
    if (caller?.email?.toLowerCase() !== OWNER_EMAIL) throw new Error("Only the owner account can change the admin login");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email: toAdminEmail(data.username), email_confirm: true, password: toAdminPassword(data.password),
    });
    if (error) throw new Error(error.message.includes("already") ? "That login ID is taken" : "Couldn't update the admin login");
    await supabaseAdmin.auth.admin.signOut(user.id, "global").catch(() => {});
    return { username: data.username };
  });
