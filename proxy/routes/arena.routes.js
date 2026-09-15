const express = require('express');
const router = express.Router();
const { fetchPage, fetchPageWithUrl, postPage, isLoggedIn } = require('../auth');
const { parseArena } = require('../parsers/arena');

router.use((req, res, next) => {
  if (!isLoggedIn()) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  next();
});

router.get('/', async (req, res) => {
  try {
    let url = '/arena.php';
    if (req.query.from && req.query.to) {
      url += `?from=${req.query.from}&to=${req.query.to}`;
    }
    const html = await fetchPage(url);
    const data = parseArena(html);
    res.json({ ok: true, data });
  } catch (error) {
    console.error('Arena route error:', error);
    res.status(500).json({ ok: false, error: 'Nepodařilo se načíst Arénu.' });
  }
});

router.post('/action', async (req, res) => {
  try {
    // Akcie: get_into_arena, set_arena_battle
    const { html, url } = await fetchPageWithUrl('/arena.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(req.body).toString()
      });

      if (url.includes('report.php')) {
        // Redirection to battle report detected
        return res.json({ ok: true, redirectedToReport: true, url: url });
      }
    const data = parseArena(html);
    res.json({ ok: true, data });
  } catch (error) {
    console.error('Arena action error:', error);
    res.status(500).json({ ok: false, error: 'Nepodařilo se provést akci v Aréně.' });
  }
});

module.exports = router;
