const express = require('express');
const router = express.Router();
const { fetchPage } = require('../auth');
const { parseHero } = require('../parsers/hero');

router.get('/', async (req, res) => {
  try {
    const html = await fetchPage('/hero.php');
    const data = parseHero(html);
    res.json({ ok: true, data });
  } catch (error) {
    console.error('Hero route error:', error);
    res.status(500).json({ ok: false, error: 'Nepodařilo se načíst hrdiny.' });
  }
});

router.post('/action', async (req, res) => {
  try {
    const html = await fetchPage('/hero.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(req.body).toString()
    });
    const data = parseHero(html);
    res.json({ ok: true, data });
  } catch (error) {
    console.error('Hero action error:', error);
    res.status(500).json({ ok: false, error: 'Nepodařilo se provést akci.' });
  }
});

module.exports = router;
