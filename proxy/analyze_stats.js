const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('stats.html', 'utf8');
const $ = cheerio.load(html);

// Find the main content
const content = $('.content-container').html() || $('.container').html();
console.log('CONTENT LENGTH:', content ? content.length : 0);

// Check if there are tables
const tables = [];
$('table').each((i, el) => {
   const ths = [];
   $(el).find('th').each((j, th) => ths.push($(th).text().trim()));
   
   const rows = [];
   $(el).find('tr').slice(1, 3).each((j, tr) => {
       const tds = [];
       $(tr).find('td').each((k, td) => tds.push($(td).text().trim().replace(/\s+/g, ' ')));
       rows.push(tds.join(' | '));
   });

   tables.push({ id: $(el).attr('id'), class: $(el).attr('class'), ths, sampleRows: rows });
});

console.log(JSON.stringify(tables, null, 2));

// Check subviews menus (like players vs alliances)
const menus = [];
$('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('stats.php?')) {
        menus.push($(el).text().trim() + ' -> ' + href);
    }
});
console.log('MENUS:', menus);
