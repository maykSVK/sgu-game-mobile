const express = require('express');
const { fetchPage, postPage } = require('../auth');
const cheerio = require('cheerio');
const router = express.Router();

// GET /api/messages?contact=ID&page=N
router.get('/', async (req, res) => {
  try {
    const contactId = req.query.contact || '';
    const page = req.query.page || 1;
    let url = '/messages.php?page=' + page;
    if (contactId) {
      url += '&contact=' + contactId;
    }

    const html = await fetchPage(url);
    const $ = cheerio.load(html);
    
    if (html.includes('Neprihlásený') || html.includes('Nepřihlášený') || html.includes('Přihlášení')) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    // 1. Zoznam kontaktov
    const contacts = [];
    $('.message-box-contacts .contact').each((i, el) => {
      const contactLink = $(el).find('a[href*="contact="]').first();
      const linkUrl = contactLink.attr('href') || '';
      
      let id = null;
      if (linkUrl && linkUrl.includes('contact=')) {
        id = new URLSearchParams(linkUrl.split('?')[1]).get('contact');
      }

      // the actual name is exactly the text of the link
      const rawText = contactLink.text().trim();
      
      const isOnline = $(el).find('.contact-is-online').length > 0;
      
      const unreadBadge = $(el).find('.badge-secondary').text().trim();
      const unreadCount = unreadBadge ? parseInt(unreadBadge) : 0;
      
      const muted = $(el).find('input[name="unmute"]').length > 0;
      const contact_id_form = $(el).find('input[name="contact_id"]').val() || id;

      if (id || contact_id_form) {
        contacts.push({
          id: contact_id_form || id,
          name: rawText || 'Neznámy',
          isOnline,
          unreadCount,
          muted,
          active: contactId === (contact_id_form || id)
        });
      }
    });

    // 2. Chat pre vybrany kontakt
    let chat = null;
    if (contactId) {
      chat = {
        messages: [],
        contactName: $('.message-header h3').text().replace(/\s+/g, ' ').trim(),
        contactStatus: $('.message-header small').text().trim()
      };

      $('.message-box-message').each((i, el) => {
        const isSent = $(el).hasClass('sent');
        let avatar = $(el).find('.contact-avatar').attr('src') || $(el).find('img').first().attr('src');
        if (avatar && avatar.startsWith('/')) avatar = 'https://www.sgu-game.cz' + avatar;
        
        let time = $(el).find('.message-time').text().trim();
        
        let msgHtml = $(el).find('div').first().html() || '';
        
        // fix images
        msgHtml = msgHtml.replace(/src="\/img\/smiles\//g, 'src="https://www.sgu-game.cz/img/smiles/');
        msgHtml = msgHtml.replace(/src="\/img\//g, 'src="https://www.sgu-game.cz/img/');
        msgHtml = msgHtml.replace(/src="\/app\/data\//g, 'src="https://www.sgu-game.cz/app/data/');

        chat.messages.push({
          id: i, // temp id
          isSent,
          avatar,
          time,
          html: msgHtml.trim()
        });
      });
      
      // reverznut poradie aby najnovsie boli dole (zvycajne) - alebo zachovat, uvidime ako je to v orginal
      // original je asi od najstarsej po najnovsiu zhora nadol. nechame ako je.
    }

    res.json({
      ok: true,
      data: {
        contacts,
        chat,
        page: parseInt(page)
      }
    });

  } catch (error) {
    console.error('Messages parse error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// POST /api/messages/send
router.post('/send', async (req, res) => {
  try {
    const { contact, message } = req.body;
    if (!contact || !message) return res.status(400).json({ok:false, error:'Missing params'});

    const params = new URLSearchParams();
    params.append('contact', contact);
    params.append('msg', message);
    params.append('send_msg', 'Odeslat');

    await postPage('/messages.php?contact=' + contact, params.toString());
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/messages/contact
router.post('/contact', async (req, res) => {
  try {
    const { playerName } = req.body;
    const params = new URLSearchParams();
    params.append('player_name', playerName);
    params.append('add_player', 'Pridat');

    await postPage('/messages.php', params.toString());
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/messages/mute
router.post('/mute', async (req, res) => {
  try {
    const { contactId, mute } = req.body; // mute is true/false
    const params = new URLSearchParams();
    params.append('contact_id', contactId);
    if (mute) {
      params.append('mute', 'mute');
    } else {
      params.append('unmute', 'unmute');
    }
    
    await postPage('/messages.php', params.toString());
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
