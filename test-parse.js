const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('planet.html', 'utf8');
const $ = cheerio.load(html);

const items = [];
$('.infobox-standard').each((_, el) => {
    const title = $(el).find('.infobox-standard-title').text().trim();
    if ($(el).hasClass('x3')) return; // Main info

    let imageClass = $(el).find('.infrastructure-img').attr('class') || '';
    if (!imageClass) imageClass = $(el).find('.artifact').attr('class') || '';

    if (imageClass) {
        items.push({
            title,
            imageClass: imageClass.trim(),
            html: $(el).find('.infobox-standard-body').html()
        });
    }
});
console.log(items.length + ' items found.');
console.log(items[0]);
