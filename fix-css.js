const fs = require('fs');
let css = fs.readFileSync('frontend/src/assets/planets.css', 'utf8');

// Fix the unclosed quotes
// Find url('https://sgu-game.cz/img/icon-observatory.png")
css = css.replace(/url\(['"]?https:\/\/sgu-game\.cz\/([^'"]+)['"]?\)/g, "url('https://sgu-game.cz/$1')");

fs.writeFileSync('frontend/src/assets/planets.css', css);
console.log('Fixed quotes in planets.css');
