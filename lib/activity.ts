import type { SupabaseClient } from "@supabase/supabase-js";

export type ActivityAction =
  | "login"
  | "logout"
  | "vault_create"
  | "vault_update"
  | "vault_delete"
  | "vault_view"
  | "breach_check"
  | "health_scan";

export async function logActivity(
  supabase: SupabaseClient,
  userId: string,
  action: ActivityAction,
  metadata: Record<string, unknown> = {}
) {
  await supabase.from("activity_logs").insert({ user_id: userId, action, metadata });
}
