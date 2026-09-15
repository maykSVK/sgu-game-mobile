const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');
const { fetchPage } = require('../auth');
const qs = require('querystring');

router.get('/', async (req, res) => {
  try {
    const html = await fetchPage('/upgrade.php?subview=neural_armchair');
    if (!html) return res.status(500).json({ error: 'Failed to fetch neural armchair' });

    const $ = cheerio.load(html);
    const infoboxes = [];
    $('.infobox-standard').each((i, el) => {
      const title = $(el).find('.infobox-standard-title').text().trim();
      if (title && !title.toLowerCase().includes('chat')) {
        let bodyHtml = $(el).find('.infobox-standard-body').html();
        if (bodyHtml) {
           infoboxes.push({ title, html: bodyHtml.trim() });
        }
      }
    });

    res.json({ data: { infoboxes } });
  } catch (error) {
    console.error('Neural fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const postData = qs.stringify(req.body);
    const html = await fetchPage('/upgrade.php?subview=neural_armchair', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      },
      body: postData
    });

    const $ = cheerio.load(html);
    const infoboxes = [];
    $('.infobox-standard').each((i, el) => {
      const title = $(el).find('.infobox-standard-title').text().trim();
      if (title && !title.toLowerCase().includes('chat')) {
        let bodyHtml = $(el).find('.infobox-standard-body').html();
        if (bodyHtml) {
           infoboxes.push({ title, html: bodyHtml.trim() });
        }
      }
    });

    res.json({ data: { infoboxes } });
  } catch (error) {
    console.error('Neural post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
