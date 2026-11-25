/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(native, os = 'android') {
  const source = fs.readFileSync(path.resolve(__dirname, '../../services/PermissionService.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compiled)(() => ({ NativeModules: { BrainSpacePermissions: native }, Platform: { OS: os } }), module, module.exports);
  return module.exports;
}
test('returning from settings alone cannot grant any permission', () => {
  const { permissionStatus } = load();
  for (const key of ['usage', 'overlay', 'accessibility', 'battery', 'popup', 'autostart']) {
    assert.equal(permissionStatus(key, null), 'off');
    assert.equal(permissionStatus(key, {}), 'off');
  }
});
test('OEM user confirmations are distinct from Android verification', () => {
  const { permissionStatus } = load();
  assert.equal(permissionStatus('popup', { popupConfirmed: true }), 'confirmed');
  assert.equal(permissionStatus('autostart', { autostartConfirmed: true }), 'confirmed');
  assert.equal(permissionStatus('battery', { xiaomi: true, battery: true }), 'off');
  assert.equal(permissionStatus('battery', { xiaomi: true, batteryConfirmed: true }), 'confirmed');
  assert.equal(permissionStatus('battery', { xiaomi: false, battery: true }), 'granted');
});
test('revoked system access overrides prior state', () => {
  const { permissionStatus } = load();
  assert.equal(permissionStatus('accessibility', { accessibility: true }), 'granted');
  assert.equal(permissionStatus('accessibility', { accessibility: false, consent: true }), 'off');
  assert.equal(permissionStatus('overlay', { overlay: false, showCounter: true }), 'off');
});
test('unsupported platforms and old builds return unavailable without fake counts', async () => {
  for (const service of [load().PermissionService, load({ getSnapshot: () => ({}) }, 'ios').PermissionService]) {
    assert.equal(service.available, false);
    assert.equal(await service.snapshot(), null);
    assert.equal(await service.open('usage'), false);
    assert.equal(await service.configure([], true), false);
  }
});
test('the bridge preserves explicit app choices and propagates save failures', async () => {
  let received;
  const { PermissionService } = load({ configureReels: async (...args) => { received = args; throw new Error('disk full'); } });
  await assert.rejects(PermissionService.configure(['com.instagram.android'], true), /disk full/);
  assert.deepEqual(received, [['com.instagram.android'], true]);
});
