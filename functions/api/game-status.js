export async function onRequestGet({ env }) {
  let state = null;
  if (env.ETRANOM_ADMIN_KV) {
    const raw = await env.ETRANOM_ADMIN_KV.get('game:maintenance');
    if (raw) { try { state = JSON.parse(raw); } catch { state = { enabled: true }; } }
  }
  return Response.json({ maintenance: !!state, message: state?.message || '' }, { headers: { 'cache-control': 'no-store' } });
}
