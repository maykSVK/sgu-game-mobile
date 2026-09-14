const express = require('express');
const { fetchPage, postPage, isLoggedIn } = require('../auth');
const { parseDestiny } = require('../parsers/destiny');
const router = express.Router();

router.get('/', async (req, res) => {
  if (!isLoggedIn()) return res.status(401).json({ ok: false, error: 'Not logged in' });
  try {
    const html = await fetchPage('/destiny.php');
    res.json({ ok: true, data: parseDestiny(html) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.post('/', async (req, res) => {
  if (!isLoggedIn()) return res.status(401).json({ ok: false, error: 'Not logged in' });
  try {
    const response = await postPage('/destiny.php', req.body);
    res.json({ ok: true, data: parseDestiny(response.body) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
