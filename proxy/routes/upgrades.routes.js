const express = require('express');
const router = express.Router();
const { fetchPage } = require('../auth');
const { parseUpgrade } = require('../parsers/upgrades');
const qs = require('querystring');

router.get('/:subview', async (req, res) => {
  try {
    const subview = req.params.subview;
    const html = await fetchPage(`/upgrade.php?subview=${subview}`);
    if (!html) return res.status(500).json({ error: 'Failed to fetch upgrade' });

    const data = parseUpgrade(html);
    res.json({ data });
  } catch (error) {
    console.error('Upgrade fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:subview', async (req, res) => {
  try {
    const subview = req.params.subview;
    const postData = qs.stringify(req.body);
    
    const html = await fetchPage(`/upgrade.php?subview=${subview}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      },
      body: postData
    });
    
    const data = parseUpgrade(html);
    res.json({ data });
  } catch (error) {
    console.error('Upgrade post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
