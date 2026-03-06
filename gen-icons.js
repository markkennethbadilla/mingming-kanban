const sharp = require('sharp');
const fs = require('fs');
const svg = fs.readFileSync('public/logo.svg');
const bg = { r: 254, g: 246, b: 238, alpha: 255 };

(async () => {
  await sharp(svg).resize(154, 154).extend({ top: 19, bottom: 19, left: 19, right: 19, background: bg }).png().toFile('public/icon-maskable-192.png');
  await sharp(svg).resize(410, 410).extend({ top: 51, bottom: 51, left: 51, right: 51, background: bg }).png().toFile('public/icon-maskable-512.png');
  // Also generate a favicon.ico sized png (32x32)
  await sharp(svg).resize(32, 32).png().toFile('public/favicon-32.png');
  await sharp(svg).resize(16, 16).png().toFile('public/favicon-16.png');
  console.log('All icons generated');
})();
