const fs = require('fs');
const html = fs.readFileSync('test_upgrade_filters_2.html');
const str = html.toString('binary');
const idx = str.indexOf('name="upgrade_filters" value="');
const slice = html.slice(idx, idx + 60);
console.log(slice);
