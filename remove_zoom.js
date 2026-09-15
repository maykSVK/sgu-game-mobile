const fs = require('fs');
const path = 'c:/GitHub/sgu-game-mobile/frontend/src/views/UniverseView.vue';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/<div v-if="universeData" class="zoom-controls">[\s\S]*?<\/div>/, '');

fs.writeFileSync(path, content);
