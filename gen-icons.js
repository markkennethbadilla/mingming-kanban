const sharp = require('sharp');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const svgPath = path.join(publicDir, 'logo.svg');

async function generate() {
  const sizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32.png', size: 32 },
    { name: 'favicon-16.png', size: 16 },
  ];

  for (const { name, size } of sizes) {
    await sharp(svgPath, { density: 300 })
      .resize(size, size, { kernel: sharp.kernel.nearest })
      .png()
      .toFile(path.join(publicDir, name));
    console.log('[OK] ' + name + ' (' + size + 'x' + size + ')');
  }

  // Maskable icons need safe zone padding (cream bg)
  const maskableSizes = [
    { name: 'icon-maskable-192.png', size: 192 },
    { name: 'icon-maskable-512.png', size: 512 },
  ];

  for (const { name, size } of maskableSizes) {
    const iconSize = Math.round(size * 0.8);
    const padding = Math.round((size - iconSize) / 2);
    const icon = await sharp(svgPath, { density: 300 })
      .resize(iconSize, iconSize, { kernel: sharp.kernel.nearest })
      .png()
      .toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 254, g: 246, b: 238, alpha: 1 } }
    })
      .composite([{ input: icon, left: padding, top: padding }])
      .png()
      .toFile(path.join(publicDir, name));
    console.log('[OK] ' + name + ' (' + size + 'x' + size + ', maskable)');
  }

  console.log('[OK] All icons generated from pixel cat SVG');
}

generate().catch(e => { console.error(e); process.exit(1); });
