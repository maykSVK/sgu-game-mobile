const express = require('express');
const { login, logout, isLoggedIn, username } = require('../auth');
const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username: user, password } = req.body;
  if (!user || !password) {
    return res.status(400).json({ ok: false, error: 'Chýba meno alebo heslo' });
  }
  try {
    const result = await login(user, password);
    res.json(result);
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ ok: false, error: 'Chyba servera: ' + e.message });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const result = await logout();
    res.json(result);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/auth/status
router.get('/status', (req, res) => {
  res.json({ loggedIn: isLoggedIn(), username: username() });
});

module.exports = router;
