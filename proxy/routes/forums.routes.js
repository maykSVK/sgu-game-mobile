const express = require('express');
const { fetchPage, postPage } = require('../auth');
const cheerio = require('cheerio');
const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const forumId = req.params.id;
    const html = await fetchPage('/forums.php?forum=' + forumId);
    const $ = cheerio.load(html);
    
    if (html.includes('Neprihlásený') || html.includes('Prihlásenie') || html.includes('Nepřihlášený') || html.includes('Přihlášení')) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    const title = $('th').first().text().trim() || 'Fórum';
    
    // Zistime, ci ma uzivatel pravo pridat prispevok (ci existuje formular)
    const canPost = $('textarea[name="sgu-forum-editor"]').length > 0;
    
    const posts = [];
    $('.forum-box').each((i, el) => {
      const id = $(el).attr('id');
      const headerHtml = $(el).find('.forum-box-header').html();
      
      let author = 'Neznámy';
      let avatar = '/img/default-contact.jpg';
      let isSystem = false;
      
      const authorLink = $(el).find('.forum-box-header-item a').first();
      if (authorLink.length > 0) {
        author = authorLink.text().trim();
      } else if (headerHtml && headerHtml.includes('Systém')) {
        author = 'Systém';
        isSystem = true;
      }
      
      const timeHtml = $(el).find('.forum-box-header-item').eq(2).text();
      const time = timeHtml.replace('NOVÉ!', '').trim();
      
      const avatarImg = $(el).find('.forum-avatar img').first();
      if (avatarImg.length > 0) {
        let rawSrc = avatarImg.attr('src');
        if (rawSrc && rawSrc.startsWith('/')) {
          avatar = 'https://www.sgu-game.cz' + rawSrc;
        } else {
          avatar = rawSrc;
        }
      }

      let message = $(el).find('.forum-message-text').html();
      if (!message) {
          message = $(el).find('.forum-message').text();
      }
      
      if (message) {
          message = message.replace(/src="\/img\/smiles\//g, 'src="https://www.sgu-game.cz/img/smiles/');
          message = message.replace(/src="\/img\//g, 'src="https://www.sgu-game.cz/img/');
          message = message.replace(/src="\/app\/data\//g, 'src="https://www.sgu-game.cz/app/data/');
      }

      posts.push({
        id,
        author,
        isSystem,
        avatar,
        time,
        message: message ? message.trim() : ''
      });
    });

    res.json({
      ok: true,
      data: {
        title,
        canPost,
        posts
      }
    });

  } catch (error) {
    console.error('Forum parse error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post('/:id/post', async (req, res) => {
  try {
    const forumId = req.params.id;
    const { subject, message } = req.body;
    
    if (!message) {
       return res.status(400).json({ ok: false, error: 'Správa nesmie byť prázdna.' });
    }

    // Najprv si stiahneme stranku, aby sme zistili pripadne skryte inputy (napr. alliance_id)
    const html = await fetchPage('/forums.php?forum=' + forumId);
    const $ = cheerio.load(html);
    
    if ($('textarea[name="sgu-forum-editor"]').length === 0) {
       return res.status(403).json({ ok: false, error: 'Nemáte právo pridávať príspevky do tohto fóra.' });
    }

    const params = new URLSearchParams();
    params.append('forum', forumId);
    params.append('re', subject || '');
    params.append('sgu-forum-editor', message);
    params.append('send_post', 'Odeslat');

    const allianceInput = $('input[name="alliance_id"]');
    if (allianceInput.length > 0) {
       params.append('alliance_id', allianceInput.val());
    }

    const responseHtml = await postPage('/forums.php?forum=' + forumId, params.toString());
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Forum post error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
