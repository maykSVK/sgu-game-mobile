const express = require('express');
const { fetchPage, isLoggedIn } = require('../auth');
const { parseResearch } = require('../parsers/research');
const router = express.Router();

// GET /api/research
router.get('/', async (req, res) => {
  if (!isLoggedIn()) return res.status(401).json({ ok: false, error: 'Nie si prihlásený' });
  try {
    const html = await fetchPage('/research.php'); // Tu sa nachádza tech-strom
    const data = parseResearch(html);
    res.json({ ok: true, data });
  } catch (e) {
    console.error('Research error:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/research - Start research
router.post('/', async (req, res) => {
  if (!isLoggedIn()) return res.status(401).json({ ok: false, error: 'Nie si prihlásený' });
  try {
    const { technology_id } = req.body;
    if (!technology_id) return res.status(400).json({ ok: false, error: 'Chýba technology_id' });
    
    // Potrebujeme volať research.php?technology=X s POST parametrom research_technology=Vyzkoumat
    const { postPage, fetchPage } = require('../auth');
    const result = await postPage(`/research.php?technology=${technology_id}`, {
      technology_id: technology_id,
      research_technology: 'Vyzkoumat'
    });
    
    // Try to extract toast or error message from result.body, or from redirected page
    let resultMsg = 'Odpoveď servera (bez správy)';
    let finalHtml = result.body;
    
    if (result.status === 302 && result.location) {
      // Sleduje presmerovanie aby sme získali HTML so správou
      const path = result.location.replace('https://www.sgu-game.cz', '');
      finalHtml = await fetchPage(path);
    }
    
    const cheerio = require('cheerio');
    const $ = cheerio.load(finalHtml);
    
    // Hľadáme napr. notyf.error('...') alebo notyf.success('...')
    const scripts = $('script').text();
    const notyfMatch = scripts.match(/notyf\.(error|success)\(['"](.*?)['"]/);
    let toastType = 'error';
    if (notyfMatch) {
      toastType = notyfMatch[1]; // 'error' or 'success'
      resultMsg = notyfMatch[2];
    } else {
      const alertBox = $('.alert').first().text().trim();
      if (alertBox) resultMsg = alertBox;
    }
    
    res.json({ ok: true, message: resultMsg, type: toastType });
  } catch (e) {
    console.error('Research POST error:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/research/:id - Get details for a specific technology
router.get('/:id', async (req, res) => {
  if (!isLoggedIn()) return res.status(401).json({ ok: false, error: 'Nie si prihlásený' });
  try {
    const { fetchPage } = require('../auth');
    const { parseResearch } = require('../parsers/research');
    const html = await fetchPage(`/research.php?technology=${req.params.id}`);
    const data = parseResearch(html);
    res.json({ ok: true, data: data.selectedInfo });
  } catch (e) {
    console.error('Research detail error:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
