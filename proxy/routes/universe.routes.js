const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');
const { fetchPage } = require('../auth');
const qs = require('querystring');

router.get('/', async (req, res) => {
  try {
    const galaxy = req.query.galaxy || '';
    const url = galaxy ? `/universe.php?subview=${galaxy}` : '/universe.php';
    const html = await fetchPage(url);
    if (!html) return res.status(500).json({ error: 'Failed to fetch universe map' });

    const $ = cheerio.load(html);
    const data = {
      destiny: { x: 0, y: 0, radius: 100 },
      objects: [],
      galaxyInfo: null
    };

    // 1. Get galaxy info block
    const galaxyInfoBox = $('.infobox-standard.x2').first();
    if (galaxyInfoBox.length) {
      data.galaxyInfo = {
        title: galaxyInfoBox.find('.infobox-standard-title').text().trim(),
        html: galaxyInfoBox.find('.infobox-standard-body').html().trim()
      };
    }

    // 2. Extract DOM nodes to get classes (for icons)
    const domObjects = {};
    $('#universe > div').each((i, el) => {
      const id = $(el).attr('id');
      if (id) {
        domObjects[id] = {
          classes: $(el).attr('class') || '',
          html: $(el).html() || ''
        };
      }
    });

    // 3. Find the script block with coordinates
    const scriptMatch = html.match(/<script language="JavaScript" type="text\/javascript">([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      const scriptContent = scriptMatch[1];

      // Extract Destiny's position (x = 123; y = 456;)
      const xMatch = scriptContent.match(/x\s*=\s*(-?\d+(?:\.\d+)?);/);
      const yMatch = scriptContent.match(/y\s*=\s*(-?\d+(?:\.\d+)?);/);
      if (xMatch && yMatch) {
        data.destiny.x = parseFloat(xMatch[1]);
        data.destiny.y = parseFloat(yMatch[1]);
      }

      
      
      // Extract Target position from the #universe.line function
      const lineRegex = /\$\("#universe"\)\.line\(universe\.left \+ ([-\d.]+),\s*1120 - ([-\d.]+),\s*universe\.left \+ ([-\d.]+),\s*1120 - ([-\d.]+)/;
      const lineMatch = scriptContent.match(lineRegex);
      if (lineMatch) {
        data.destiny.target = {
          x: parseFloat(lineMatch[3]),
          y: parseFloat(lineMatch[4])
        };
      }
// Extract offsets
      const offsetRegex = /\$\('#([^']+)'\)\.offset\(\{left: universe\.left \+ \(([^)]+)\),top: universe\.top \+ 1000 - \(([^)]+)\)\}/g;
      let match;
      const positions = {};
      while ((match = offsetRegex.exec(scriptContent)) !== null) {
        // Skip destiny internals
        if (match[1] === 'destiny' || match[1] === 'destiny-radius' || match[1] === 'destiny-final-radius') continue;
        
        positions[match[1]] = {
          id: match[1],
          x: parseInt(match[2], 10),
          y: parseInt(match[3], 10)
        };
      }

      // Extract Tipped tooltips
      const tippedRegex = /Tipped\.create\('#([^']+)',\s*function\s*\([^)]*\)\s*\{return\s+'(.*?)';\}\);/g;
      const tooltips = {};
      while ((match = tippedRegex.exec(scriptContent)) !== null) {
        tooltips[match[1]] = match[2].replace(/\\"/g, '"'); // Unescape quotes
      }
      
      data.tooltips = tooltips;

      // Merge data
      for (const [id, pos] of Object.entries(positions)) {
        const domNode = domObjects[id] || {};
        let tooltip = tooltips[id] || '';

        // Prebrat tooltipy pre children (napr. planet-occupier v planet-icons)
        if (id.startsWith('planet-icons-')) {
          const num = id.replace('planet-icons-', '');
          if (tooltips[`planet-occupier-${num}`]) {
            tooltip = tooltips[`planet-occupier-${num}`];
          }
        }

        data.objects.push({
          id,
          x: pos.x,
          y: pos.y,
          classes: domNode.classes,
          innerHtml: domNode.html,
          tooltipHtml: tooltip
        });
      }
    }

    res.json({ ok: true, data });
  } catch (error) {
    console.error('Universe fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST pro "Letět"
router.post('/', async (req, res) => {
  try {
    const postData = qs.stringify(req.body);
    // Posielame action: universe.php
    const html = await fetchPage('/universe.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      },
      body: postData
    });

    // Pripravime rovnaky json, pretoze sa mohlo daco zmenit
    // Namiesto duplikacie to len forwardneme na GET. Ale wait, pre jednoduchost:
    res.json({ ok: true });
  } catch (error) {
    console.error('Universe post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
