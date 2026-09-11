const express = require('express');
const { postPage, isLoggedIn } = require('../auth');
const router = express.Router();

/**
 * POST /api/ajax
 * Prepošle požiadavku priamo na /app/ajax/index.php
 * Body: { method: '...', ...params }
 */
router.post('/', async (req, res) => {
  if (!isLoggedIn()) return res.status(401).json({ ok: false, error: 'Nie si prihlásený' });

  try {
    const result = await postPage('/app/ajax/index.php', req.body);
    // Skús parsovať JSON, ak nie, vráť text
    try {
      res.json({ ok: true, data: JSON.parse(result.body) });
    } catch {
      res.json({ ok: true, data: result.body });
    }
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
