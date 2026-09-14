const express = require('express');
const router = express.Router();
const { fetchPage, isLoggedIn } = require('../auth');
const { parseCrew } = require('../parsers/crew');

router.use((req, res, next) => {
  if (!isLoggedIn()) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  next();
});

router.get('/', async (req, res) => {
  try {
    const html = await fetchPage('/crew.php');
    const data = parseCrew(html);
    res.json({ ok: true, data });
  } catch (error) {
    console.error('Crew route error:', error);
    res.status(500).json({ ok: false, error: 'Nepodařilo se načíst Posádku.' });
  }
});

router.post('/action', async (req, res) => {
  try {
    const html = await fetchPage('/crew.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(req.body).toString()
    });
    const data = parseCrew(html);
    res.json({ ok: true, data });
  } catch (error) {
    console.error('Crew action error:', error);
    res.status(500).json({ ok: false, error: 'Nepodařilo se provést akci.' });
  }
});

module.exports = router;
