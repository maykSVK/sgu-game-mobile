const fs = require('fs');
const path = 'c:/GitHub/sgu-game-mobile/frontend/src/views/UniverseView.vue';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import UniverseNav')) {
  content = content.replace('import Panzoom from \'@panzoom/panzoom\';', 'import Panzoom from \'@panzoom/panzoom\';\nimport UniverseNav from \'../components/UniverseNav.vue\';');
}

if (!content.includes('<UniverseNav />')) {
  content = content.replace('<div class="universe-page">', '<div class="universe-page">\n    <UniverseNav />');
}

fs.writeFileSync(path, content);
console.log('Added UniverseNav to UniverseView.vue');
