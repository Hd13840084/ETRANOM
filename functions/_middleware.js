/** Cloudflare Pages middleware: server-enforced emergency shutdown. */
export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  const path = url.pathname;
  // Keep the separate admin console and status/control API reachable during shutdown.
  if (path === '/admin.html' || path.startsWith('/api/admin') || path === '/api/game-status') return next();
  if (!env.ETRANOM_ADMIN_KV) return next(); // Not armed until KV is configured.
  const state = await env.ETRANOM_ADMIN_KV.get('game:maintenance');
  if (!state) return next();
  let data = {}; try { data = JSON.parse(state); } catch {}
  return new Response(`<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ETRANOM | تعمیرات</title><body style="margin:0;background:#100d15;color:#eee;font:16px Tahoma;display:grid;place-items:center;min-height:100vh;text-align:center"><main style="padding:28px;max-width:520px"><h1 style="color:#d6b477">ETRANOM</h1><h2>بازی موقتاً بسته است</h2><p>${escapeHtml(data.message || 'سرزمین‌ها موقتاً در حالت تعمیرات قرار دارند. لطفاً بعداً مراجعه کنید.')}</p></main></body></html>`, { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'retry-after': '300' } });
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
