const express = require('express');
const router = express.Router();
const { fetchPage } = require('../auth');
const { parseArtifacts } = require('../parsers/artifacts');

router.get('/', async (req, res) => {
  try {
    const html = await fetchPage('/artifacts.php');
    if (!html) return res.status(500).json({ error: 'Failed to fetch artifacts' });

    const data = parseArtifacts(html);
    res.json({ data });
  } catch (error) {
    console.error('Artifacts fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
