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
  assert.match(classic, /سامانه ورود هنوز آماده نشده است/);
});

test('startup state is initialized before the first asynchronous SDK import', () => {
  const firstAwait = moduleScript.indexOf('await import(');
  assert.ok(firstAwait > 0);
  for (const declaration of ['let socialLaunch = null;', 'let notificationChannels=[]', 'const notificationCounts=']) {
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

test('auth actions are published after login/signup functions are declared', () => {
  const loginAt = moduleScript.indexOf('async function login()');
  const signupAt = moduleScript.indexOf('async function signup()');
  const publishAt = moduleScript.indexOf('window.__ETRANOM_AUTH_ACTIONS__={');
  assert.ok(loginAt >= 0 && signupAt > loginAt && publishAt > signupAt);
  assert.match(moduleScript, /authRequestWithTimeout\(supabase\.auth\.signInWithPassword/);
  assert.match(moduleScript, /authRequestWithTimeout\(supabase\.auth\.signUp/);
});

test('login and signup requests have a bounded wait and prevent overlapping requests', () => {
  assert.match(moduleScript, /function authRequestWithTimeout\(promise,ms,message\)/);
  assert.match(moduleScript, /if\(authRequestInFlight\)return/);
  assert.match(moduleScript, /,15000,/);
});
