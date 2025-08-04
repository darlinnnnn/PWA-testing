const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#3b82f6"/>
  <circle cx="256" cy="256" r="120" fill="white"/>
  <circle cx="256" cy="256" r="80" fill="#3b82f6"/>
  <circle cx="256" cy="256" r="40" fill="white"/>
</svg>
`;

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons
iconSizes.forEach(size => {
  const iconPath = path.join(publicDir, `icon-${size}x${size}.png`);
  const svgPath = path.join(publicDir, `icon-${size}x${size}.svg`);
  
  // For now, we'll create SVG files since we can't generate PNGs without canvas
  fs.writeFileSync(svgPath, svgIcon);
  console.log(`Created icon-${size}x${size}.svg`);
});

// Create other required files
const files = [
  { name: 'favicon.ico', content: '<!-- Placeholder favicon -->' },
  { name: 'favicon-16x16.png', content: '<!-- Placeholder 16x16 -->' },
  { name: 'favicon-32x32.png', content: '<!-- Placeholder 32x32 -->' },
  { name: 'apple-touch-icon.png', content: '<!-- Placeholder apple touch icon -->' },
  { name: 'android-chrome-192x192.png', content: '<!-- Placeholder android chrome -->' },
  { name: 'safari-pinned-tab.svg', content: svgIcon },
  { name: 'browserconfig.xml', content: `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/icon-152x152.png"/>
            <TileColor>#3b82f6</TileColor>
        </tile>
    </msapplication>
</browserconfig>` }
];

files.forEach(file => {
  const filePath = path.join(publicDir, file.name);
  fs.writeFileSync(filePath, file.content);
  console.log(`Created ${file.name}`);
});

console.log('\nIcon generation complete!');
console.log('Note: For production, replace these placeholder files with actual PNG icons.'); 