import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const classic = html.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1] || '';
const moduleScript = html.match(/<script type="module">\s*([\s\S]*?)<\/script>/)?.[1] || '';

test('login and signup controls have dependency-free early event handlers', () => {
  assert.match(classic, /form\?\.addEventListener\('submit'/);
  assert.match(classic, /signup\?\.addEventListener\('click'/);
  assert.match(classic, /__ETRANOM_AUTH_ACTIONS__/);
  assert.match(classic, /در حال آماده‌سازی اتصال امن/);
});

test('Supabase CDN imports have independent bounded attempts and a visible failure', () => {
  assert.match(moduleScript, /const importWithTimeout=/);
  assert.match(moduleScript, /cdn\.jsdelivr\.net[^\n]*,8000\)/);
  assert.match(moduleScript, /esm\.sh[^\n]*,8000\)/);
  assert.match(moduleScript, /کتابخانه اتصال Supabase بارگذاری نشد/);
});

test('authentication actions are published immediately after Supabase and auth state initialization', () => {
  const clientAt = moduleScript.indexOf('const supabase = createClient');
  const refsAt = moduleScript.indexOf("const gate=document.getElementById('auth-gate')");
  const publishAt = moduleScript.indexOf('window.__ETRANOM_AUTH_ACTIONS__=');
  const guildAt = moduleScript.indexOf('// Guild system');
  assert.ok(clientAt >= 0 && refsAt > clientAt && publishAt > refsAt && guildAt > publishAt);
  assert.equal((moduleScript.match(/window\.__ETRANOM_AUTH_ACTIONS__=/g) || []).length, 1);
});

test('authentication actions remain available before later social and guild UI initialization', () => {
  const publishAt = moduleScript.indexOf('window.__ETRANOM_AUTH_ACTIONS__=');
  const loginAt = moduleScript.indexOf('async function login()');
  const signupAt = moduleScript.indexOf('async function signup()');
  assert.ok(publishAt > 0 && loginAt > 0 && signupAt > loginAt);
  assert.match(moduleScript, /login:\(\)=>login\(\)\.catch/);
  assert.match(moduleScript, /signup:\(\)=>signup\(\)\.catch/);
});

test('startup state is initialized before the first asynchronous SDK import', () => {
  const firstAwait = moduleScript.indexOf('await importWithTimeout(');
  assert.ok(firstAwait > 0);
  for (const declaration of ['let socialLaunch = null;', 'let notificationChannels=[]', 'const notificationCounts=', 'let authRequestInFlight=false;']) {
    assert.ok(moduleScript.indexOf(declaration) >= 0);
    assert.ok(moduleScript.indexOf(declaration) < firstAwait, `${declaration} must precede first await`);
  }
});

test('social launch and notification channels have no later temporal-dead-zone declarations', () => {
  assert.equal((moduleScript.match(/\b(?:const|let|var)\s+socialLaunch\b/g) || []).length, 1);
  assert.equal((moduleScript.match(/\b(?:const|let|var)\s+notificationChannels\b/g) || []).length, 1);
  assert.match(moduleScript, /socialLaunch=document\.createElement\('button'\)/);
  assert.match(moduleScript, /if\(socialLaunch && !socialLaunch\.isConnected\)/);
});

test('login and signup requests have bounded waits and prevent overlapping requests', () => {
  assert.match(moduleScript, /function authRequestWithTimeout\(promise,ms,message\)/);
  assert.match(moduleScript, /if\(authRequestInFlight\)return/);
  assert.match(moduleScript, /auth\.signInWithPassword\(\{email,password\}\),15000,/);
  assert.match(moduleScript, /auth\.signUp\(\{email,password\}\),15000,/);
});
