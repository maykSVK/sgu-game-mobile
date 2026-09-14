const fs = require('fs');
const css = fs.readFileSync('compact.css', 'utf8');

const rules = [];
const lines = css.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/\.(planet-|infrastructure-img|artifact)/)) {
        let rule = lines[i];
        if (!rule.includes('}')) {
            // Keep adding lines until we find the closing brace
            let j = i + 1;
            while (j < lines.length && !rule.includes('}')) {
                rule += '\n' + lines[j];
                j++;
            }
        }
        rules.push(rule);
    }
}

const finalCss = rules.join('\n').replace(/url\(['"]?\.\.\//g, "url('https://sgu-game.cz/");
fs.writeFileSync('frontend/src/assets/planets.css', finalCss);
console.log('Done!');
