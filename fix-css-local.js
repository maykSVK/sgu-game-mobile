const fs = require('fs');
let css = fs.readFileSync('frontend/src/assets/planets.css', 'utf8');

// Replace url('https://sgu-game.cz/img/...') with url('/img/...')
css = css.replace(/url\(['"]?https:\/\/sgu-game\.cz\/img\/([^'"]+)['"]?\)/g, "url('/img/$1')");

fs.writeFileSync('frontend/src/assets/planets.css', css);
console.log('Fixed image URLs in planets.css');
