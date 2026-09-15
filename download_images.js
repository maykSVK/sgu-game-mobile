const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
  'upgrade-armchair.jpg',
  'upgrade-filters.jpg',
  'upgrade-ftl.jpg',
  'upgrade-resources.jpg',
  'upgrade-shields.jpg',
  'upgrade-chambers.jpg',
  'upgrade-sublight.jpg'
];

const destDir = path.join(__dirname, 'frontend', 'public', 'img');

images.forEach(img => {
  const file = fs.createWriteStream(path.join(destDir, img));
  https.get(`https://www.sgu-game.cz/img/${img}`, response => {
    if (response.statusCode === 200) {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${img}`);
      });
    } else {
      console.log(`Failed to download ${img}: ${response.statusCode}`);
    }
  }).on('error', err => {
    console.error(`Error downloading ${img}: ${err.message}`);
  });
});
