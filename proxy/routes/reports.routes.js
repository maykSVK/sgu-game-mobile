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
    
    const $ = cheerio.load(html);
    
    // Odstránime zbytočnosti (pätička, prémiový obchod, facebook, discord...)
    $('.premium-shop, .facebook-badge, .discord-badge, footer, .footer, .chat-box').remove();
    
    let contentHtml = $('.content-container').html();
    if (!contentHtml) contentHtml = $('.container .row .col-12').html();
    if (!contentHtml) contentHtml = '<p class="p-4 text-center">Nenašli sa žiadne dáta.</p>';
    
    // DEBUG: Extract all forms
    const forms = [];
    $('form').each((i, el) => {
       forms.push($.html(el));
    });
    require('fs').writeFileSync(__dirname + '/reports_forms.json', JSON.stringify(forms, null, 2));

    res.json({ ok: true, data: { html: contentHtml } });
  } catch (err) {
    require('fs').writeFileSync(__dirname + '/reports_error.log', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
