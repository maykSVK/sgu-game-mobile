const fs = require('fs');
const html = fs.readFileSync('test_universe.html', 'utf8');
const matches = html.match(/<script language="JavaScript" type="text\/javascript">/g);
console.log('Number of script tags:', matches ? matches.length : 0);
