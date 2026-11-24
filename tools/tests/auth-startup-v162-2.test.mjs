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

test('shared startup UI state is hoisted before the first asynchronous boundary', () => {
  const firstAwait = moduleScript.indexOf('await importWithTimeout(');
  assert.ok(firstAwait > 0);
  for (const declaration of [
    'let socialLaunch = null;',
    'let socialOverlay = null, partyOverlay = null, guildOverlay = null, guildLaunch = null;',
    'let guildTeacherVisited = false, guildChatChannel = null;',
    'let partySystem = null, partyInitPromise = null;',
    "let socialOverview = null, socialTab = 'profile'",
    'let notificationChannels=[]',
    'const notificationCounts=',
    'let authRequestInFlight=false;'
  ]) {
    const at = moduleScript.indexOf(declaration);
    assert.ok(at >= 0, `${declaration} exists`);
    assert.ok(at < firstAwait, `${declaration} must precede first await`);
  }
});

test('shared overlay references have one early binding and later assignments only', () => {
  for (const name of ['socialOverlay','partyOverlay','guildOverlay','guildLaunch','socialLaunch','notificationChannels']) {
    const declarations = moduleScript.match(new RegExp(`\\b(?:const|let|var)\\s+[^;\\n]*\\b${name}\\b`, 'g')) || [];
    assert.equal(declarations.length, 1, `${name} has one lexical declaration`);
  }
  assert.match(moduleScript, /socialOverlay=document\.createElement\('div'\)/);
  assert.match(moduleScript, /partyOverlay=document\.createElement\('div'\)/);
  assert.match(moduleScript, /guildOverlay=document\.createElement\('div'\)/);
  assert.match(moduleScript, /guildLaunch=document\.createElement\('button'\)/);
  assert.match(moduleScript, /if\(socialOverlay && !socialOverlay\.isConnected\)/);
});

test('login and signup remain unavailable until the full startup module is initialized', () => {
  assert.match(classic, /if\(!actions\?\.ready \|\| typeof action!==\'function\'\)/);
  const publishAt = moduleScript.indexOf('window.__ETRANOM_AUTH_ACTIONS__=');
  const overlayAt = moduleScript.indexOf("socialOverlay=document.createElement('div')");
  const partyAt = moduleScript.indexOf("partyOverlay=document.createElement('div')");
  const loginAt = moduleScript.indexOf('async function login()');
  const signupAt = moduleScript.indexOf('async function signup()');
  const readyAt = moduleScript.indexOf('window.__ETRANOM_AUTH_ACTIONS__.ready = true;');
  const recoveryAt = moduleScript.indexOf('supabase.auth.getSession()');
  assert.ok(publishAt > 0 && overlayAt > publishAt && partyAt > overlayAt);
  assert.ok(readyAt > loginAt && readyAt > signupAt && recoveryAt > readyAt);
  assert.match(moduleScript, /ready:false/);
  assert.match(moduleScript, /window\.dispatchEvent\(new CustomEvent\('etranom:auth-ready'\)\)/);
});

test('social UI callbacks safely handle a not-yet-created overlay', () => {
  assert.match(moduleScript, /function socialOpen\(\)\{if\(!socialOverlay\)return;/);
  assert.match(moduleScript, /if\(!socialOverlay\|\|!player\?\.user_id/);
  assert.match(moduleScript, /if\(socialOverlay && !socialOverlay\.isConnected\)/);
});

test('login and signup requests have bounded waits and prevent overlapping requests', () => {
  assert.match(moduleScript, /function authRequestWithTimeout\(promise,ms,message\)/);
  assert.match(moduleScript, /if\(authRequestInFlight\)return/);
  assert.match(moduleScript, /auth\.signInWithPassword\(\{email,password\}\),15000,/);
  assert.match(moduleScript, /auth\.signUp\(\{email,password\}\),15000,/);
});

test('party overlay listeners are bound only after the overlay exists', () => {
  const createAt = moduleScript.indexOf("partyOverlay=document.createElement('div')");
  const closeAt = moduleScript.indexOf("partyCloseButton?.addEventListener('click'");
  const overlayAt = moduleScript.indexOf("partyOverlay?.addEventListener('click'");
  assert.ok(createAt > 0, 'party overlay is created');
  assert.ok(closeAt > createAt, 'party close listener is attached after creation');
  assert.ok(overlayAt > createAt, 'party backdrop listener is attached after creation');
  assert.ok(!/partyOverlay\.addEventListener\(/.test(moduleScript), 'no unguarded listener call on nullable overlay');
});

test('social and guild startup listener targets are guarded', () => {
  assert.match(moduleScript, /guildLaunch\?\.addEventListener/);
  assert.match(moduleScript, /guildOverlay\?\.addEventListener/);
  assert.match(moduleScript, /socialOverlay\?\.addEventListener/);
});
