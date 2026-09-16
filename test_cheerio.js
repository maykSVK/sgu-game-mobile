const cheerio = require('cheerio');
const html = `
<div class="contact mt-3">
    <a href="#">
        <div class="position-relative d-inline-block">AVATAR</div>
        <span class="contact-name">
            <a href="/messages.php?contact=123">USERNAME_HERE</a>
        </span>
    </a>
</div>`;
const $ = cheerio.load(html);
$('.contact').each((i, el) => {
    console.log("nameEl text:", $(el).find('.contact-name').text().trim());
    console.log("inner a text:", $(el).find('a[href*="contact="]').text().trim());
});
