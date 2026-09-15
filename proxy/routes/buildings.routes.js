const express = require('express');
const router = express.Router();
const { fetchPage } = require('../auth');
const { parseBuildings } = require('../parsers/buildings');

router.get('/', async (req, res) => {
  try {
    const html = await fetchPage('/buildings.php');
    if (!html) return res.status(500).json({ error: 'Failed to fetch buildings' });

    const data = parseBuildings(html);
    res.json({ data });
  } catch (error) {
    console.error('Buildings fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
