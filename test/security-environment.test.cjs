const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');
const root = require('node:path').join(__dirname, '..');
const source = fs.readFileSync(root + '/src/config/environment.ts', 'utf8');
const compiled = fs.readFileSync(root + '/dist/config/environment.js', 'utf8');
// These fixed strings are public unit-test fixtures, not generated or deployable keys.
const fixture = 'non-secret-unit-test-fixture-value';
const historical = 'public-placeholder-that-must-change-this';
for (const [kind, code] of [['source', stripTypeScriptTypes(source).replace(/export function /g, 'function ')], ['dist', compiled]]) {
  test(kind + ': JWT validation fails closed without revealing supplied values', () => {
    const context = { process: { env: {} }, exports: {} };
    vm.createContext(context); vm.runInContext(code, context);
    for (const value of [undefined, '', ' '.repeat(40), 'short', historical, '<at-least-64-random-hex-characters>']) {
      context.process.env.JWT_SECRET = value;
      assert.throws(() => context.requireJwtSecret(), /JWT_SECRET/);
    }
    context.process.env.JWT_SECRET = fixture;
    assert.equal(context.requireJwtSecret(), fixture);
    context.process.env.DB_PASSWORD = '';
    assert.throws(() => context.requireEnvironment('DB_PASSWORD'), /DB_PASSWORD/);
    context.process.env.DB_PASSWORD = fixture;
    assert.equal(context.requireEnvironment('DB_PASSWORD'), fixture);
  });
}
test('source and runtime JWT configuration use required secret and HS256', () => {
  for (const f of ['src/auth/auth.module.ts','src/auth/jwt.strategy.ts','dist/auth/auth.module.js','dist/auth/jwt.strategy.js']) {
    const data = fs.readFileSync(root + '/' + f, 'utf8');
    assert.match(data, /requireJwtSecret/); assert.match(data, /HS256/); assert.doesNotMatch(data, /JWT_SECRET\s*\|\|/);
  }
});
test('seed scripts do not supply default credentials or log password variables', () => {
  for (const f of ['scripts/seed-demo-users.ts','scripts/seed-class-users.ts']) {
    const data = fs.readFileSync(root + '/' + f, 'utf8');
    assert.doesNotMatch(data, /process\.env\.(?:DB_PASSWORD|DEMO_SEED_PASSWORD|CLASS_USERS_SEED_PASSWORD)\s*\?\?/);
    assert.doesNotMatch(data, /console\.log\([^\n]*(?:DEMO_PASSWORD|COMMON_PASSWORD)/);
  }
  assert.doesNotMatch(fs.readFileSync(root + '/database/init.postgresql.sql', 'utf8'), /INSERT INTO users/i);
});
