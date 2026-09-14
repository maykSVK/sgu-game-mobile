const express = require('express');
const router = express.Router();
const { fetchPage, postPage, isLoggedIn } = require('../auth');
const { parsePlanet } = require('../parsers/planet');

// GET - parse planet page
router.get('/', async (req, res) => {
  if (!isLoggedIn()) return res.status(401).json({ error: 'Not logged in' });

  // Pasať všetky querystring parametre (planet, type, category)
  const qs = new URLSearchParams(req.query).toString();
  const path = `/planet.php${qs ? '?' + qs : ''}`;

  try {
    const html = await fetchPage(path);
    if (!html) return res.status(500).json({ error: 'Failed to fetch planet' });

    const data = parsePlanet(html);
    res.json({ data });
  } catch (error) {
    console.error('Planet fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST - handle actions
router.post('/', async (req, res) => {
  if (!isLoggedIn()) return res.status(401).json({ error: 'Not logged in' });

  // Pasať všetky querystring parametre pre cieľový post
  const qs = new URLSearchParams(req.query).toString();
  const path = `/planet.php${qs ? '?' + qs : ''}`;
  const formData = req.body; // predpoklad: proxy klient pošle URLSearchParams alebo JSON

  try {
    const response = await postPage(path, formData);
    if (!response || !response.body) return res.status(500).json({ error: 'Failed to post planet action' });

    const data = parsePlanet(response.body);
    res.json({ ok: true, data });
  } catch (error) {
    console.error('Planet post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
