const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const db = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'binggge',
  database: 'binggge',
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/shows', async (req, res) => {
  const query = req.query.q || '';

  try {
    const response = await fetch(
      `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    const shows = data.map(({ show }) => ({
      id: show.id,
      titre: show.name,
      annee: show.premiered ? show.premiered.slice(0, 4) : null,
      image: show.image ? show.image.medium : null,
    }));

    res.json(shows);
  } catch (error) {
    res.status(500).json({
      error: 'Erreur lors de la récupération des données TVMaze',
    });
  }
});

// POST /register
app.post('/register', async (req, res) => {
  const login = req.body && req.body.login;
  if (!login) {
    return res.status(400).json({ error: 'login manquant' });
  }

  try {
    await db.query('INSERT INTO users(login) VALUES($1)', [login]);
    res.status(201).json({ login });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'login déjà pris' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// le garde des routes privées
const user = (req, res, next) =>
  req.get('X-User')
    ? next()
    : res.status(401).json({ error: 'non authentifié' });

app.get('/watchlist', user, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT w.* FROM watchlist w
       JOIN users u ON u.id = w.user_id
       WHERE u.login = $1`,
      [req.get('X-User')]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/watchlist', user, async (req, res) => {
  const { show_id, title } = req.body || {};
  if (!show_id || !title) {
    return res.status(400).json({ error: 'show_id et title requis' });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO watchlist(user_id, show_id, title)
       SELECT id, $2::int, $3::text FROM users WHERE login = $1
       RETURNING *`,
      [req.get('X-User'), show_id, title]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'utilisateur inconnu' });
    }
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
