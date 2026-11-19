const json = (data, status=200) => Response.json(data, { status, headers: { 'cache-control':'no-store' } });
export async function onRequest({ request, env }) {
  if (!['GET','POST'].includes(request.method)) return json({error:'method_not_allowed'},405);
  if (!env.ETRANOM_ADMIN_KV || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.ADMIN_USER_IDS) return json({error:'admin_not_configured'},503);
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i,'');
  if (!token) return json({error:'unauthorized'},401);
  const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers:{ apikey:env.SUPABASE_SERVICE_ROLE_KEY, authorization:`Bearer ${token}` } });
  if (!userRes.ok) return json({error:'invalid_session'},401);
  const user = await userRes.json();
  const admins = env.ADMIN_USER_IDS.split(',').map(x=>x.trim()).filter(Boolean);
  if (!admins.includes(user.id)) return json({error:'forbidden'},403);
  if (request.method === 'GET') {
    const raw = await env.ETRANOM_ADMIN_KV.get('game:maintenance');
    return json({maintenance:!!raw, state:raw?JSON.parse(raw):null, admin:user.id});
  }
  let body; try { body = await request.json(); } catch { return json({error:'invalid_json'},400); }
  const action = String(body.action || '');
  if (action === 'close' || action === 'open') {
    if (action === 'close') {
      const message = String(body.message || 'سرزمین‌ها موقتاً در حالت تعمیرات قرار دارند.').slice(0,240);
      await env.ETRANOM_ADMIN_KV.put('game:maintenance', JSON.stringify({enabled:true,message,by:user.id,at:new Date().toISOString()}));
    } else await env.ETRANOM_ADMIN_KV.delete('game:maintenance');
    await audit(env, user.id, action, null);
    return json({success:true,maintenance:action==='close'});
  }
  if (action === 'ban' || action === 'unban' || action === 'delete' || action === 'kick') {
    const uid = String(body.user_id || '').trim();
    if (!/^[0-9a-f-]{36}$/i.test(uid)) return json({error:'invalid_user_id'},400);
    if (admins.includes(uid)) return json({error:'cannot_modify_admin'},403);
    let endpoint, method='PUT', payload={};
    if (action==='ban') { endpoint=`${env.SUPABASE_URL}/auth/v1/admin/users/${uid}`; payload={ban_duration:String(Math.max(1,Math.min(876000,Number(body.hours)||720))+'h')}; }
    if (action==='unban') { endpoint=`${env.SUPABASE_URL}/auth/v1/admin/users/${uid}`; payload={ban_duration:'none'}; }
    if (action==='delete') { endpoint=`${env.SUPABASE_URL}/auth/v1/admin/users/${uid}`; method='DELETE'; }
    if (action==='kick') return json({error:'kick_requires_session_revocation_endpoint_not_enabled'},501);
    const r=await fetch(endpoint,{method,headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'content-type':'application/json'},...(method==='DELETE'?{}:{body:JSON.stringify(payload)})});
    const result=await r.json().catch(()=>({})); if(!r.ok)return json({error:'supabase_admin_error',detail:result.msg||result.message||result.error_description||'request_failed'},r.status);
    await audit(env,user.id,action,uid); return json({success:true,action,user_id:uid});
  }
  return json({error:'unknown_action'},400);
}
async function audit(env, admin, action, target) {
  const key=`audit:${Date.now()}:${crypto.randomUUID()}`;
  await env.ETRANOM_ADMIN_KV.put(key,JSON.stringify({admin,action,target,at:new Date().toISOString()}),{expirationTtl:60*60*24*90});
}
