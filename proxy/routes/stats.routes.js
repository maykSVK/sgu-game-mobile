const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');
const { fetchPage } = require('../auth');

router.get('/profile', async (req, res) => {
  try {
    const playerName = req.query.playerName || '';
    let url = '/stats.php?subview=profile';
    if (playerName) url += '&playerName=' + encodeURIComponent(playerName);
    
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    if (html.includes('Neprihlásený') || html.includes('Nepřihlášený') || html.includes('Přihlášení')) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    const data = {
      found: false,
      user: {},
      info: {},
      awards: [],
      history: []
    };

    // Ak sa nenasiel hrac, vypise to prazdnu stranku so search barom
    // Ak sa nasiel, existuju .infobox-standard (Hrac, Informace, Historie)
    const infoboxes = $('.infobox-standard');
    
    infoboxes.each((i, el) => {
      const title = $(el).find('.infobox-standard-title').text().trim();
      const body = $(el).find('.infobox-standard-body');
      
      const tLower = title.toLowerCase();
      console.log("Found infobox with title:", title, "tLower:", tLower);
      if (tLower.startsWith('hr') || i === 0) {
        data.found = true;
        // Avatar
        let avatar = body.find('.forums-avatar').attr('src');
        if (avatar && avatar.startsWith('/')) {
           avatar = 'https://www.sgu-game.cz' + avatar;
        } else if (!avatar) {
           avatar = 'https://www.sgu-game.cz/img/default-contact.jpg';
        }
        data.user.avatar = avatar;

        // Country
        let country = body.find('.country-flag img').attr('src');
        if (country) {
            data.user.countryFlag = 'https://www.sgu-game.cz' + country;
        }

        // Vip
        data.user.isVip = body.find('.vip-table').length > 0;
        
        // Status & Name (it is inside a link inside a div with class representing status like 'player', 'admin')
        const nameLink = body.find('a[href*="playerName="]');
        let parsedUsername = nameLink.text().trim();
        if (!parsedUsername) {
           parsedUsername = body.find('input[name="player_name"]').attr('value') || '';
        }
        data.user.username = parsedUsername;
        data.user.statusClass = nameLink.parent().attr('class') || 'player';
        
        console.log("Parsed User:", data.user);
      }
      
      if (title.toLowerCase().includes('informace')) {
        const rows = body.find('tr');
        rows.each((j, rowEl) => {
          const cells = $(rowEl).find('td');
          if (cells.length === 2) {
             const label = $(cells[0]).text().trim().toLowerCase();
             const val = $(cells[1]).text().trim();
             
             if (label.includes('hrdina')) data.info.hero = val;
             else if (label.includes('aliance')) data.info.alliance = val;
             else if (label.includes('aktivní') || label.includes('aktivn')) data.info.lastActive = val;
             else if (label.includes('status')) data.info.status = val;
             else if (label.includes('prázdninový')) data.info.holiday = val;
             else if (label.includes('aréna')) data.info.arena = val;
             else if (label.includes('expedice')) data.info.expeditions = val;
             else if (label.includes('členem od') || label.includes('clenem od')) data.info.memberSince = val;
             else if (label.includes('ocenění') || label.includes('ocenen')) {
                // Parse awards images and tooltips (veteran, alliance-trophy, medals)
                $(cells[1]).find('.sgu-tooltip').each((k, iconEl) => {
                   let cls = $(iconEl).attr('class');
                   let tooltip = $(iconEl).attr('data-sgu-tooltip');
                   
                   let type = 'unknown';
                   if (cls.includes('veteran')) type = 'veteran';
                   if (cls.includes('alliance-trophy')) type = 'alliance-trophy';
                   if (cls.includes('gold-medal')) type = 'gold-medal';
                   if (cls.includes('silver-medal')) type = 'silver-medal';
                   if (cls.includes('bronze-medal')) type = 'bronze-medal';
                   
                   // Clean tooltip HTML to extract plain text
                   const $t = cheerio.load(tooltip);
                   const cleanText = $t.text().replace(/\s+/g, ' ').trim();
                   
                   data.awards.push({ type, html: tooltip, text: cleanText });
                });
             }
          }
        });
      }

      if (title.toLowerCase().includes('historie')) {
         const rows = body.find('table tbody tr');
         rows.each((j, rowEl) => {
             // skip header
             if ($(rowEl).find('th').length > 0) return;
             
             const cells = $(rowEl).find('td');
             if (cells.length === 1) {
                 // "Zatím žádné dokončené herní věky"
                 return;
             }
             if (cells.length >= 10) {
                 data.history.push({
                     ageType: $(cells[0]).text().trim(),
                     age: $(cells[1]).text().trim(),
                     position: $(cells[2]).text().trim(),
                     fragments: $(cells[3]).text().trim(),
                     research: $(cells[4]).text().trim(),
                     expeditions: $(cells[5]).text().trim(),
                     arenaRecord: $(cells[6]).text().trim(),
                     arenaTrophies: $(cells[7]).text().trim(),
                     finishTime: $(cells[8]).text().trim(),
                     alliance: $(cells[9]).text().trim().replace(/\[\?\]/g, '').trim()
                 });
             }
         });
      }
    });

    res.json({ ok: true, data });

  } catch (error) {
    console.error('Stats parse error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
