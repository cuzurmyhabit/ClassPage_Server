require('reflect-metadata');

const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const { setImmediate: nextTurn } = require('node:timers/promises');
const { MealsService } = require('../src/meals/meals.service');

const DATE = '2026-10-05';
const FRESH = JSON.stringify({ lunch: { dishes: ['밥', '국'], kcal: 721 } });
const STALE = JSON.stringify({ lunch: { dishes: ['이전 메뉴'] } });
const ERROR_MESSAGE = '급식 정보를 불러오지 못했습니다.';
const settings = {
  loadAll: async () => ({ office_code: 'B10', school_code: 'test-school' }),
};
const originalFetch = global.fetch;
const originalApiKey = process.env.NEIS_API_KEY;

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function response() {
  return new Response(JSON.stringify({
    mealServiceDietInfo: [
      { head: [{ RESULT: { CODE: 'INFO-000' } }] },
      { row: [{ DDISH_NM: '밥<br/>국', MMEAL_SC_CODE: '2', CAL_INFO: '720.5 Kcal' }] },
    ],
  }), { status: 200 });
}

function memoryRepo(initialContent) {
  const rows = new Map();
  if (initialContent !== undefined) {
    rows.set(DATE, { meal_date: DATE, content: initialContent, fetched_at: new Date() });
  }
  return {
    rows,
    writes: 0,
    reads: 0,
    deletes: 0,
    async findOneBy({ meal_date }) {
      this.reads++;
      return rows.get(meal_date) ?? null;
    },
    async upsert(row, columns) {
      assert.deepEqual(columns, ['meal_date']);
      this.writes++;
      rows.set(row.meal_date, { ...row });
    },
    async delete({ meal_date }) {
      this.deletes++;
      rows.delete(meal_date);
    },
  };
}

function gatedFetch() {
  const gate = deferred();
  const started = deferred();
  const urls = [];
  global.fetch = async (url, options) => {
    urls.push(new URL(url));
    assert.ok(options.signal instanceof AbortSignal);
    started.resolve();
    await gate.promise;
    return response();
  };
  return { gate, started, urls };
}

beforeEach(() => {
  process.env.NEIS_API_KEY = 'test-only-not-a-real-key';
  global.fetch = async () => { throw new Error('Unexpected external request'); };
});

afterEach(() => {
  global.fetch = originalFetch;
  if (originalApiKey === undefined) delete process.env.NEIS_API_KEY;
  else process.env.NEIS_API_KEY = originalApiKey;
});

test('valid cache: 20 requests reuse DB without calling NEIS', async () => {
  const repo = memoryRepo(FRESH);
  const service = new MealsService(repo, settings);
  const { urls } = gatedFetch();
  const results = await Promise.all(Array.from({ length: 20 }, () => service.getMealForDate(DATE, false)));
  assert.ok(results.every((value) => value === FRESH));
  assert.equal(urls.length, 0);
  assert.equal(repo.writes, 0);
});

test('cold cache: 20 simultaneous requests share one NEIS call and one upsert', async () => {
  const repo = memoryRepo();
  const service = new MealsService(repo, settings);
  const { gate, urls } = gatedFetch();
  const pending = Promise.all(Array.from({ length: 20 }, () => service.getMealForDate(DATE, false)));
  await nextTurn();
  assert.equal(urls.length, 1);
  assert.equal(urls[0].searchParams.get('MLSV_YMD'), '20261005');
  gate.resolve();
  const results = await pending;
  assert.ok(results.every((value) => value === FRESH));
  assert.equal(repo.writes, 1);
  assert.equal(repo.rows.size, 1);
});

test('single-flight stays active until the DB write finishes', async () => {
  const repo = memoryRepo();
  const writeGate = deferred();
  const upsert = repo.upsert.bind(repo);
  repo.upsert = async (...args) => { await writeGate.promise; return upsert(...args); };
  const service = new MealsService(repo, settings);
  let calls = 0;
  global.fetch = async () => { calls++; return response(); };
  const first = service.getMealForDate(DATE, false);
  await nextTurn();
  const followers = Array.from({ length: 19 }, () => service.getMealForDate(DATE, false));
  await nextTurn();
  assert.equal(calls, 1);
  assert.equal(repo.writes, 0);
  writeGate.resolve();
  assert.ok((await Promise.all([first, ...followers])).every((value) => value === FRESH));
  assert.equal(repo.writes, 1);
});

test('20 force-refresh requests bypass old cache but share one refresh', async () => {
  const repo = memoryRepo(STALE);
  const service = new MealsService(repo, settings);
  const { gate, urls } = gatedFetch();
  const pending = Promise.all(Array.from({ length: 20 }, () => service.getMealForDate(DATE, true)));
  await nextTurn();
  assert.equal(urls.length, 1);
  assert.equal(repo.reads, 0);
  gate.resolve();
  assert.ok((await pending).every((value) => value === FRESH));
  assert.equal(repo.writes, 1);
  assert.equal(repo.rows.get(DATE).content, FRESH);
});

test('an ordinary request joins an already-running forced refresh', async () => {
  const service = new MealsService(memoryRepo(STALE), settings);
  const { gate, urls } = gatedFetch();
  const forced = service.getMealForDate(DATE, true);
  await nextTurn();
  const ordinary = service.getMealForDate(DATE, false);
  await nextTurn();
  assert.equal(urls.length, 1);
  gate.resolve();
  assert.deepEqual(await Promise.all([forced, ordinary]), [FRESH, FRESH]);
});

test('different dates have independent flights (20 requests per date)', async () => {
  const repo = memoryRepo();
  const service = new MealsService(repo, settings);
  const { gate, urls } = gatedFetch();
  const pending = Promise.all([DATE, '2026-10-06'].flatMap((date) =>
    Array.from({ length: 20 }, () => service.getMealForDate(date, false))));
  await nextTurn();
  assert.equal(urls.length, 2);
  gate.resolve();
  assert.ok((await pending).every((value) => value === FRESH));
  assert.equal(repo.writes, 2);
  assert.equal(repo.rows.size, 2);
});

test('a refresh starting during a cache read takes priority over a stale snapshot', async () => {
  const repo = memoryRepo(STALE);
  const readGate = deferred();
  const find = repo.findOneBy.bind(repo);
  repo.findOneBy = async (...args) => {
    const snapshot = await find(...args);
    await readGate.promise;
    return snapshot;
  };
  const service = new MealsService(repo, settings);
  const { gate, urls } = gatedFetch();
  const ordinary = service.getMealForDate(DATE, false);
  await nextTurn();
  const forced = service.getMealForDate(DATE, true);
  await nextTurn();
  readGate.resolve();
  await nextTurn();
  assert.equal(urls.length, 1);
  gate.resolve();
  assert.deepEqual(await Promise.all([ordinary, forced]), [FRESH, FRESH]);
});

test('failed shared calls are cleaned up so the next request can retry', async (t) => {
  for (const failure of ['network', 'HTTP', 'JSON']) {
    await t.test(failure, async () => {
      const repo = memoryRepo(STALE);
      const service = new MealsService(repo, settings);
      const gate = deferred();
      let calls = 0;
      global.fetch = async () => {
        calls++;
        await gate.promise;
        if (failure === 'network') throw new Error('Test network failure');
        if (failure === 'HTTP') return new Response('{}', { status: 503 });
        return new Response('invalid JSON');
      };
      const pending = Promise.all(Array.from({ length: 20 }, () => service.getMealForDate(DATE, true)));
      await nextTurn();
      assert.equal(calls, 1);
      gate.resolve();
      assert.ok((await pending).every((value) => value === ERROR_MESSAGE));
      assert.equal(repo.rows.size, 0);
      assert.equal(repo.writes, 0);
      global.fetch = async () => { calls++; return response(); };
      assert.equal(await service.getMealForDate(DATE, false), FRESH);
      assert.equal(calls, 2);
    });
  }
});

test('DB write failure rejects the shared flight and does not block retry', async () => {
  const repo = memoryRepo();
  const upsert = repo.upsert.bind(repo);
  repo.upsert = async () => { throw new Error('Test DB failure'); };
  const service = new MealsService(repo, settings);
  const { gate, urls } = gatedFetch();
  const pending = Promise.allSettled(Array.from({ length: 20 }, () => service.getMealForDate(DATE, false)));
  await nextTurn();
  gate.resolve();
  const results = await pending;
  assert.ok(results.every((result) => result.status === 'rejected' && result.reason.message === 'Test DB failure'));
  assert.equal(urls.length, 1);
  repo.upsert = upsert;
  assert.equal(await service.getMealForDate(DATE, false), FRESH);
  assert.equal(urls.length, 2);
  assert.equal(repo.rows.size, 1);
});

test('a delayed cache miss rechecks data saved by a completed refresh', async () => {
  const repo = memoryRepo();
  const readGate = deferred();
  const find = repo.findOneBy.bind(repo);
  let firstRead = true;
  repo.findOneBy = async (...args) => {
    if (firstRead) {
      firstRead = false;
      await readGate.promise;
      return null;
    }
    return find(...args);
  };
  const service = new MealsService(repo, settings);
  let calls = 0;
  global.fetch = async () => { calls++; return response(); };
  const delayed = service.getMealForDate(DATE, false);
  await nextTurn();
  assert.equal(await service.getMealForDate(DATE, true), FRESH);
  readGate.resolve();
  assert.equal(await delayed, FRESH);
  assert.equal(calls, 1);
  assert.equal(repo.writes, 1);
});

test('invalid or empty cached content is refetched', async (t) => {
  for (const content of ['{}', '{invalid', ERROR_MESSAGE]) {
    await t.test(content, async () => {
      const repo = memoryRepo(content);
      const service = new MealsService(repo, settings);
      let calls = 0;
      global.fetch = async () => { calls++; return response(); };
      assert.equal(await service.getMealForDate(DATE, false), FRESH);
      assert.equal(calls, 1);
      assert.equal(repo.rows.get(DATE).content, FRESH);
    });
  }
});

test('completed forced flights are removed: a later forced request refreshes again', async () => {
  const service = new MealsService(memoryRepo(), settings);
  let calls = 0;
  global.fetch = async () => { calls++; return response(); };
  assert.equal(await service.getMealForDate(DATE, true), FRESH);
  assert.equal(await service.getMealForDate(DATE, true), FRESH);
  assert.equal(calls, 2);
});

test('PostgreSQL integration (disposable local test DB only)', {
  skip: !process.env.MEALS_TEST_DATABASE_URL,
}, async (t) => {
  const url = new URL(process.env.MEALS_TEST_DATABASE_URL);
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname), 'Only local test DBs are allowed');
  assert.match(url.pathname, /^\/classpage_meals_test(?:_[a-z0-9_]+)?$/, 'Use a disposable classpage_meals_test DB');
  const { DataSource } = require('typeorm');
  const { MealCache } = require('../src/entities/meal-cache.entity');
  const db = new DataSource({
    type: 'postgres', url: url.toString(), entities: [MealCache], synchronize: true,
  });
  await db.initialize();
  try {
    const repo = db.getRepository(MealCache);
    await t.test('one service, 20 requests: one NEIS call, one row, no errors', async () => {
      await repo.clear();
      const service = new MealsService(repo, settings);
      const { gate, started, urls } = gatedFetch();
      const pending = Promise.all(Array.from({ length: 20 }, () => service.getMealForDate(DATE, false)));
      await started.promise;
      await nextTurn();
      assert.equal(urls.length, 1);
      gate.resolve();
      assert.ok((await pending).every((value) => value === FRESH));
      assert.equal(await repo.count(), 1);
      assert.equal((await repo.findOneByOrFail({ meal_date: DATE })).content, FRESH);
      t.diagnostic('20 requests -> NEIS mock calls: 1; PostgreSQL rows: 1; errors: 0');
    });
    await t.test('20 independent service instances: concurrent upserts do not cause PK conflicts', async () => {
      await repo.clear();
      const { gate, urls } = gatedFetch();
      const pending = Promise.all(Array.from({ length: 20 }, () =>
        new MealsService(repo, settings).getMealForDate(DATE, true)));
      await nextTurn();
      assert.equal(urls.length, 20);
      gate.resolve();
      assert.ok((await pending).every((value) => value === FRESH));
      assert.equal(await repo.count(), 1);
      t.diagnostic('20 independent flights -> NEIS mock calls: 20; PostgreSQL rows: 1; errors: 0');
    });
  } finally {
    await db.destroy();
  }
});
