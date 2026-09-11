const express = require('express');
const { fetchPage, isLoggedIn } = require('../auth');
const { parseDashboard } = require('../parsers/dashboard');
const router = express.Router();

// GET /api/dashboard
router.get('/', async (req, res) => {
  if (!isLoggedIn()) return res.status(401).json({ ok: false, error: 'Nie si prihlásený' });
  try {
    const html = await fetchPage('/dashboard.php');
    const data = parseDashboard(html);
    res.json({ ok: true, data });
  } catch (e) {
    console.error('Dashboard error:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
