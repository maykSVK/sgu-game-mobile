const fs = require('fs');
const path = 'c:/GitHub/sgu-game-mobile/frontend/src/views/DestinyView.vue';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/https:\/\/sgu-game\.cz\//g, '/sgu-game-mobile/');
content = content.replace(/https:\/\/sgu-game\.cz/g, '/sgu-game-mobile');

content = content.replace('import DashboardNav from "../components/DashboardNav.vue"', 'import DashboardNav from "../components/DashboardNav.vue"\nimport "../assets/tech.css"');

content = content.replace(/\/\* Obrazky pre originalne tech triedy[\s\S]*?\.dash-raw-html :deep\(\.et-electronics\) \{[\s\S]*?\}/g, '');
content = content.replace(/\.dash-raw-html :deep\(\.et-electronics\) \{[\s\S]*?\}/g, '');

content = content.replace(/\/\* ¦¦ TECH SLOTS \([\s\S]*?\.dash-raw-html :deep\(\.tech-slot-empty:hover\) \{[\s\S]*?\}/g, '');

fs.writeFileSync(path, content);
