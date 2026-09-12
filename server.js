const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/shows', async (req, res) => {
  const q = req.query.q || '';
  try {
    const response = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`);
    const data = await response.json();

    const shows = data.map(({ show }) => ({
      id: show.id,
      titre: show.name,
      annee: show.premiered ? show.premiered.slice(0, 4) : null,
      image: show.image ? show.image.medium : null,
    }));

    res.json(shows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des données TVMaze' });
  }
});

app.get('/watchlist', (req, res) => {
  res.json([]);
});

app.listen(3000, () => console.log('Server running on port 3000'));
