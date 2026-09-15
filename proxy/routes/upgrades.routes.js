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
    const iconv = require('iconv-lite');
    
    // Manuálny windows-1250 urlencode
    let postDataParts = [];
    for (const key in req.body) {
      const val = req.body[key];
      const encodedKey = encodeURIComponent(key);
      const valBuf = iconv.encode(val, 'win1250');
      let encodedVal = '';
      for (let i = 0; i < valBuf.length; i++) {
        // Alphanumeric characters don't need encoding strictly, but encoding all is safe for this specific usecase
        encodedVal += '%' + valBuf[i].toString(16).padStart(2, '0').toUpperCase();
      }
      postDataParts.push(`${encodedKey}=${encodedVal}`);
    }
    const postData = postDataParts.join('&');
    
    // Pass post data to proxy
    const html = await fetchPage(`/upgrade.php?subview=${subview}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, postData);
    
    const data = parseUpgrade(html);
    res.json({ data });
  } catch (error) {
    console.error('Upgrade post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
