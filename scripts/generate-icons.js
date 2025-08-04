const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

iconSizes.forEach(size => {
  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="white" opacity="0.9"/>
  <text x="${size/2}" y="${size/2 + size/12}" font-family="Arial, sans-serif" font-size="${size/4}" font-weight="bold" text-anchor="middle" fill="#667eea">PWA</text>
</svg>`;

  const iconPath = path.join(publicDir, `icon-${size}x${size}.png`);
  
  // For now, we'll create SVG files instead of PNG since we can't generate PNG without canvas
  const svgPath = path.join(publicDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  
  console.log(`✅ Generated icon-${size}x${size}.svg`);
});

// Generate screenshots for better PWA install UI
const screenshots = [
  {
    src: '/screenshot-wide.png',
    sizes: '1280x720',
    form_factor: 'wide',
    label: 'Desktop view of the PWA'
  },
  {
    src: '/screenshot-mobile.png', 
    sizes: '390x844',
    form_factor: 'narrow',
    label: 'Mobile view of the PWA'
  }
];

// Create screenshot SVGs (placeholders)
screenshots.forEach(screenshot => {
  const [width, height] = screenshot.sizes.split('x').map(Number);
  const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="screenshotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#screenshotGrad)"/>
  <rect x="${width*0.1}" y="${height*0.1}" width="${width*0.8}" height="${height*0.6}" fill="white" opacity="0.9" rx="8"/>
  <text x="${width/2}" y="${height/2}" font-family="Arial, sans-serif" font-size="${Math.min(width, height)/20}" font-weight="bold" text-anchor="middle" fill="#667eea">PWA Screenshot</text>
  <text x="${width/2}" y="${height/2 + Math.min(width, height)/15}" font-family="Arial, sans-serif" font-size="${Math.min(width, height)/30}" text-anchor="middle" fill="#666">${screenshot.label}</text>
</svg>`;
  
  const screenshotPath = path.join(publicDir, screenshot.src.replace('/', ''));
  fs.writeFileSync(screenshotPath, svg);
  console.log(`✅ Generated ${screenshot.src.replace('/', '')}`);
});

console.log('\n🎉 All PWA assets generated successfully!');
console.log('📝 Note: These are SVG placeholders. For production, replace with actual PNG icons and screenshots.'); 