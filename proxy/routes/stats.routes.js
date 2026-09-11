const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');
const { fetchPage } = require('../auth');

router.get('/', async (req, res) => {
  try {
    let targetUrl = req.query.url ? decodeURIComponent(req.query.url) : '/stats.php';
    const html = await fetchPage(targetUrl.startsWith('/') ? targetUrl : '/' + targetUrl);
    const $ = cheerio.load(html);
    
    // Odstránime zbytočnosti
    $('.premium-shop, .facebook-badge, .discord-badge, footer, .footer, .chat-box').remove();
    
    let contentHtml = $('.content-container').html();
    if (!contentHtml) contentHtml = $('.container .row .col-12').html();
    if (!contentHtml) contentHtml = '<p class="p-4 text-center">Nenašli sa žiadne dáta.</p>';
    
    res.json({ ok: true, data: { html: contentHtml } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
