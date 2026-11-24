import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const OWNER_ID = "f9531c31-8c9f-495d-baf2-d19575982f78";
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !service) return json({ error: "SERVER_CONFIGURATION_MISSING" }, 500);
  const bearer = req.headers.get("Authorization") || "";
  const token = bearer.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "AUTH_REQUIRED" }, 401);

  const userClient = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } });
  const adminClient = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await userClient.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "INVALID_SESSION" }, 401);
  const actor = authData.user.id;
  const { data: roleRow, error: roleError } = await adminClient
    .from("etranom_admin_roles").select("role,permissions").eq("user_id", actor).maybeSingle();
  if (roleError) return json({ error: "ADMIN_ROLE_LOOKUP_FAILED" }, 500);
  const role = roleRow?.role;
  const perms = roleRow?.permissions || {};
  if (!(role === "owner" || role === "super_admin" || perms.players === true)) {
    return json({ error: "ADMIN_FORBIDDEN" }, 403);
  }

  let body: { action?: string; player_id?: string; reason?: string; duration_hours?: number | null };
  try { body = await req.json(); } catch { return json({ error: "INVALID_JSON" }, 400); }
  const action = body.action;
  const playerId = body.player_id;
  if (!playerId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(playerId)) {
    return json({ error: "INVALID_PLAYER_ID" }, 400);
  }
  if (playerId === OWNER_ID) return json({ error: "OWNER_PROTECTED" }, 403);
  if (action !== "ban" && action !== "unban") return json({ error: "INVALID_ACTION" }, 400);

  const reason = action === "ban" ? String(body.reason || "").trim().slice(0, 1000) : null;
  if (action === "ban" && reason!.length < 3) return json({ error: "BAN_REASON_REQUIRED" }, 400);
  const hours = body.duration_hours == null ? null : Number(body.duration_hours);
  if (hours !== null && (!Number.isInteger(hours) || hours < 1 || hours > 87600)) {
    return json({ error: "INVALID_BAN_DURATION" }, 400);
  }
  const expiresAt = action === "ban" && hours !== null ? new Date(Date.now() + hours * 3600000).toISOString() : null;
  const authBanDuration = action === "unban" ? "none" : (hours === null ? "876000h" : `${hours}h`);

  // Apply Auth restriction first. If the audited database RPC fails, compensate Auth.
  const { error: authMutationError } = await adminClient.auth.admin.updateUserById(playerId, { ban_duration: authBanDuration });
  if (authMutationError) return json({ error: "AUTH_BAN_UPDATE_FAILED", detail: authMutationError.message }, 502);
  if (action === "ban") {
    const signOutResponse = await fetch(`${url}/auth/v1/admin/users/${playerId}/logout`, {
      method: "POST",
      headers: { apikey: service, Authorization: `Bearer ${service}`, "Content-Type": "application/json" },
      body: JSON.stringify({ scope: "global" }),
    });
    if (!signOutResponse.ok) {
      const detail = await signOutResponse.text();
      await adminClient.auth.admin.updateUserById(playerId, { ban_duration: "none" });
      return json({ error: "GLOBAL_SIGNOUT_FAILED", detail }, 502);
    }
  }
  const { data, error: rpcError } = await userClient.rpc("etranom_admin_set_ban_v1", {
    p_player_id: playerId, p_reason: reason, p_until: expiresAt,
  });
  if (rpcError) {
    await adminClient.auth.admin.updateUserById(playerId, { ban_duration: action === "ban" ? "none" : "876000h" });
    return json({ error: "BAN_RECORD_UPDATE_FAILED", detail: rpcError.message }, 502);
  }
  return json({ success: true, action, player_id: playerId, expires_at: expiresAt, result: data });
});
