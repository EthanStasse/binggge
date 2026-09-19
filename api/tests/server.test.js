const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, db } = require('../src/server');

// login unique à chaque exécution pour ne pas dépendre de l'état de la base
const login = `test_${Date.now()}`;

after(async () => {
  await db.query(
    'DELETE FROM watchlist WHERE user_id IN (SELECT id FROM users WHERE login = $1)',
    [login]
  );
  await db.query('DELETE FROM users WHERE login = $1', [login]);
  await db.end();
});

test('health répond ok', async () => {
  const r = await request(app).get('/health');
  assert.equal(r.status, 200);
});

test("une inscription crée bien l'utilisateur", async () => {
  const r = await request(app).post('/register').send({ login });
  assert.equal(r.status, 201);

  const { rows } = await db.query('SELECT 1 FROM users WHERE login = $1', [login]);
  assert.equal(rows.length, 1);
});

test('ajouter une série la fait apparaître dans /watchlist', async () => {
  const add = await request(app)
    .post('/watchlist')
    .set('X-User', login)
    .send({ show_id: 44778, title: 'Severance' });
  assert.equal(add.status, 201);

  const r = await request(app).get('/watchlist').set('X-User', login);
  assert.equal(r.status, 200);
  assert.ok(r.body.some((s) => s.show_id === 44778 && s.title === 'Severance'));
});

test('/watchlist sans en-tête renvoie 401', async () => {
  const r = await request(app).get('/watchlist');
  assert.equal(r.status, 401);
});
