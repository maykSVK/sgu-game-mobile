const express = require('express');
const { fetchPage, isLoggedIn } = require('../auth');
const router = express.Router();

// GET /api/research
router.get('/', async (req, res) => {
  if (!isLoggedIn()) return res.status(401).json({ ok: false, error: 'Nie si prihlásený' });
  res.json({ ok: true, data: { message: 'Research parser – coming soon' } });
});

module.exports = router;
