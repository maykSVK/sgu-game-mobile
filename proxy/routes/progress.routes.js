const express = require('express');
const router = express.Router();
const { fetchPage } = require('../auth');
const { parseProgress } = require('../parsers/progress');

router.get('/', async (req, res) => {
  try {
    const html = await fetchPage('/progress.php');
    const data = parseProgress(html);
    res.json({ ok: true, data });
  } catch (error) {
    console.error('Progress route error:', error);
    res.status(500).json({ ok: false, error: 'Nepodařilo se načíst postup.' });
  }
});

module.exports = router;
