const express = require('express');
const { fetchPage } = require('../auth');
const cheerio = require('cheerio');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const action = req.query.action;
    let targetUrl = req.query.url ? decodeURIComponent(req.query.url) : '/reports.php';
    
    let html;
    if (action === 'readAll') {
      const { postPage } = require('../auth');
      const response = await postPage('/reports.php', { mark_all_as_read: 'Označit vše jako přečtené' });
      html = response.body;
    } else {
      html = await fetchPage(targetUrl.startsWith('/') ? targetUrl : '/' + targetUrl);
    }
    
    const { parseReports } = require('../parsers/reports');
    const parsedData = parseReports(html);

    res.json({ ok: true, data: parsedData });
  } catch (err) {
    require('fs').writeFileSync(__dirname + '/reports_error.log', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
