const express = require('express');
const router = express.Router();
const { fetchPage } = require('../auth');
const { parseChecksums } = require('../parsers/checksums');

router.get('/', async (req, res) => {
  try {
    const html = await fetchPage('/checksums.php');
    const data = parseChecksums(html);
    res.json({ ok: true, data });
  } catch (error) {
    console.error('Checksums route error:', error);
    res.status(500).json({ ok: false, error: 'Nepodařilo se načíst historii přepočtů.' });
  }
});

module.exports = router;
