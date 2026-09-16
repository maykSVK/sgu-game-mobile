const express = require('express');
const { fetchPage, postPage } = require('../auth');
const cheerio = require('cheerio');
const router = express.Router();

// GET /api/stargate
router.get('/', async (req, res) => {
  try {
    const html = await fetchPage('/stargate.php');
    const $ = cheerio.load(html);
    
    const availableGates = [];
    $('.stargate-gates-in-radius .stargate-icon').each((i, el) => {
      const symbols = $(el).attr('data-symbols');
      if (symbols) {
        availableGates.push({
          id: symbols,
          symbols: symbols,
          name: 'Adresa v dosahu',
          isMock: false
        });
      }
    });

    let galaxy = 1;
    let transponder = 0;
    
    const scriptTags = $('script').text();
    const galaxyMatch = scriptTags.match(/galaxy\s*=\s*['"]?(\d+)['"]?/);
    if (galaxyMatch) galaxy = parseInt(galaxyMatch[1], 10);
    
    const transponderMatch = scriptTags.match(/transponder\s*=\s*(\d+)/);
    if (transponderMatch) transponder = parseInt(transponderMatch[1], 10);

    res.json({
      ok: true,
      data: {
        availableGates,
        galaxy,
        transponder,
        symDir: 'symbols'
      }
    });

  } catch (error) {
    console.error('Stargate parse error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// POST /api/stargate/dial
router.post('/dial', async (req, res) => {
  const { symbols, galaxy = 1, transponder = 0 } = req.body;
  
  try {
    const formParams = new URLSearchParams();
    formParams.append('method', 'callStargate');
    formParams.append('address', symbols);
    formParams.append('galaxy', galaxy);
    formParams.append('transponder', transponder);
    
    // Auth headers pre fetch su pridane automaticky v postPage z AsyncLocalStorage
    const responseHtml = await postPage('/app/ajax/index.php', formParams.toString(), {
       'Content-Type': 'application/x-www-form-urlencoded'
    });
    
    let responseData = {};
    try {
        responseData = JSON.parse(responseHtml);
    } catch(e) {
        return res.json({ ok: false, error: 'Nepodarilo sa spracovať odpoveď zo servera.' });
    }
    
    res.json({
      ok: true,
      ...responseData
    });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
