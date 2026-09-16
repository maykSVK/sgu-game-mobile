const { fetchPage } = require('./proxy/auth');
const cheerio = require('cheerio');

(async () => {
  const html = await fetchPage('/messages.php');
  const $ = cheerio.load(html);
  
  const contacts = [];
  .message-contact-card.each((i, el) => {
     contacts.push({
       id: .find('input[name="contact_id"]').val(),
       name: .find('span').first().text().trim(),
       unread: .find('.badge-secondary').text().trim(),
       muted: .find('input[name="unmute"]').length > 0 // if unmute exists, it's muted
     });
  });
  console.log("Contacts:", contacts);
})();
