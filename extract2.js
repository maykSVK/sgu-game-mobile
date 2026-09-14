const fs = require('fs');
const css = fs.readFileSync('compact.css', 'utf8');

const classes = [
    'planet-', 'infrastructure-img', 'artifact', 'colony-', '-extractor',
    'satellite', 'base', 'observatory', 'stargate', 'recruit', 'quest-', 'progress'
];

const rules = [];
const lines = css.split('\n');
for (let i = 0; i < lines.length; i++) {
    // Only match class selectors roughly
    if (lines[i].trim().startsWith('.') && classes.some(c => lines[i].includes(c))) {
        let rule = lines[i];
        if (!rule.includes('}')) {
            let j = i + 1;
            while (j < lines.length && !rule.includes('}')) {
                rule += '\n' + lines[j];
                j++;
            }
        }
        rules.push(rule);
    }
}

// Map specific things for planet tables
const finalCss = `
/* Zabezpeci spravne zobrazenie tabuliek na mobile (bez pretecenia) */
.dash-raw-html table {
    width: 100% !important;
    table-layout: fixed;
}
.dash-raw-html td {
    word-wrap: break-word;
    overflow-wrap: break-word;
}
/* Aby inputy a selecty nepretiekli */
.dash-raw-html input, .dash-raw-html select {
    max-width: 100%;
}

` + rules.join('\n').replace(/url\(['"]?\.\.\//g, "url('https://sgu-game.cz/");

fs.writeFileSync('frontend/src/assets/planets.css', finalCss);
console.log('Extracted ' + rules.length + ' rules.');
