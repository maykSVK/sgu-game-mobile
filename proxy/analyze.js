const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('dashboard.html', 'utf8');
const $ = cheerio.load(html);

const data = {
  divs: [],
  links: [],
};

$('div').each((i, el) => {
  const id = $(el).attr('id');
  const cls = $(el).attr('class');
  if (id || cls) {
    data.divs.push({id, cls, len: $(el).text().trim().length});
  }
});

$('a').each((i, el) => {
  data.links.push({href: $(el).attr('href'), text: $(el).text().trim()});
});

fs.writeFileSync('analyze.json', JSON.stringify(data, null, 2));
