#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes for different platforms
const iconSizes = {
  ios: [
    { size: 1024, name: 'AppStore' },
    { size: 180, name: 'iPhone-3x' },
    { size: 167, name: 'iPad-Pro' },
    { size: 152, name: 'iPad-2x' },
    { size: 120, name: 'iPhone-2x' },
    { size: 87, name: 'iPhone-1x' },
    { size: 80, name: 'Spotlight-2x' },
    { size: 76, name: 'iPad-1x' },
    { size: 60, name: 'iPhone-1x' },
    { size: 58, name: 'Spotlight-1x' },
    { size: 40, name: 'Spotlight-1x' },
    { size: 29, name: 'Settings-1x' },
    { size: 20, name: 'Notification-1x' }
  ],
  android: [
    { size: 512, name: 'PlayStore' },
    { size: 192, name: 'xxxhdpi' },
    { size: 144, name: 'xxhdpi' },
    { size: 96, name: 'xhdpi' },
    { size: 72, name: 'hdpi' },
    { size: 48, name: 'mdpi' },
    { size: 36, name: 'ldpi' }
  ]
};

// Splash screen sizes
const splashSizes = {
  ios: [
    { width: 2048, height: 2732, name: 'iPad-Pro-12.9' },
    { width: 1668, height: 2388, name: 'iPad-Pro-11' },
    { width: 1536, height: 2048, name: 'iPad-2x' },
    { width: 1125, height: 2436, name: 'iPhone-X' },
    { width: 1242, height: 2688, name: 'iPhone-XS-Max' },
    { width: 750, height: 1334, name: 'iPhone-6' },
    { width: 640, height: 1136, name: 'iPhone-5' }
  ],
  android: [
    { width: 1080, height: 1920, name: 'xxhdpi' },
    { width: 720, height: 1280, name: 'xhdpi' },
    { width: 480, height: 800, name: 'hdpi' }
  ]
};

// Create directories
function createDirectories() {
  const dirs = [
    'public/icons/ios',
    'public/icons/android',
    'public/splash/ios',
    'public/splash/android'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

// Generate icon HTML template
function generateIconHTML(size, platform, name) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Icon ${size}x${size} - ${name}</title>
  <style>
    body { margin: 0; padding: 0; background: white; }
    .icon { width: ${size}px; height: ${size}px; }
  </style>
</head>
<body>
  <div class="icon">
    <svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Background Circle -->
      <circle cx="256" cy="256" r="256" fill="url(#gradient)"/>
      
      <!-- Heart Icon -->
      <path d="M256 448C256 448 128 320 128 224C128 192 160 160 192 160C208 160 224 168 256 200C288 168 304 160 320 160C352 160 384 192 384 224C384 320 256 448 256 448Z" fill="white" stroke="white" stroke-width="8" stroke-linejoin="round"/>
      
      <!-- Partner Connection Lines -->
      <path d="M200 200L312 312" stroke="white" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
      <path d="M312 200L200 312" stroke="white" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
      
      <!-- Gradient Definition -->
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>
  </div>
</body>
</html>`;
}

// Generate splash HTML template
function generateSplashHTML(width, height, platform, name) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Splash ${width}x${height} - ${name}</title>
  <style>
    body { margin: 0; padding: 0; background: white; }
    .splash { width: ${width}px; height: ${height}px; }
  </style>
</head>
<body>
  <div class="splash">
    <svg width="${width}" height="${height}" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="1024" height="1024" fill="url(#gradient)"/>
      
      <!-- Main Heart Icon -->
      <path d="M512 896C512 896 256 640 256 448C256 384 320 320 384 320C416 320 448 336 512 400C576 336 608 320 640 320C704 320 768 384 768 448C768 640 512 896 512 896Z" fill="white" stroke="white" stroke-width="16" stroke-linejoin="round"/>
      
      <!-- Partner Connection Lines -->
      <path d="M400 400L624 624" stroke="white" stroke-width="8" stroke-linecap="round" opacity="0.8"/>
      <path d="M624 400L400 624" stroke="white" stroke-width="8" stroke-linecap="round" opacity="0.8"/>
      
      <!-- App Name -->
      <text x="512" y="700" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold">Together</text>
      <text x="512" y="750" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" opacity="0.9">Partner Collaboration</text>
      
      <!-- Gradient Definition -->
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>
  </div>
</body>
</html>`;
}

// Generate all icons
function generateIcons() {
  console.log('🎨 Generating app icons...');
  
  Object.entries(iconSizes).forEach(([platform, sizes]) => {
    sizes.forEach(({ size, name }) => {
      const html = generateIconHTML(size, platform, name);
      const filename = `icon-${size}x${size}-${name}.html`;
      const filepath = path.join('public', 'icons', platform, filename);
      
      fs.writeFileSync(filepath, html);
      console.log(`Generated: ${filepath}`);
    });
  });
}

// Generate all splash screens
function generateSplashScreens() {
  console.log('🖼️ Generating splash screens...');
  
  Object.entries(splashSizes).forEach(([platform, sizes]) => {
    sizes.forEach(({ width, height, name }) => {
      const html = generateSplashHTML(width, height, platform, name);
      const filename = `splash-${width}x${height}-${name}.html`;
      const filepath = path.join('public', 'splash', platform, filename);
      
      fs.writeFileSync(filepath, html);
      console.log(`Generated: ${filepath}`);
    });
  });
}

// Generate README for assets
function generateAssetsREADME() {
  const readme = `# App Assets

This directory contains generated HTML templates for app icons and splash screens.

## Icons

### iOS Icons
- Use the HTML files in \`icons/ios/\` to generate PNG files
- Convert to PNG using a tool like:
  - [HTML to PNG Converter](https://htmlcsstoimage.com/)
  - [Screenshot API](https://htmlcsstoimage.com/)
  - Browser screenshot tools

### Android Icons
- Use the HTML files in \`icons/android/\` to generate PNG files
- Convert to PNG using the same tools as iOS

## Splash Screens

### iOS Splash Screens
- Use the HTML files in \`splash/ios/\` to generate PNG files
- Convert to PNG using the same tools as icons

### Android Splash Screens
- Use the HTML files in \`splash/android/\` to generate PNG files
- Convert to PNG using the same tools as icons

## Conversion Tools

### Online Tools
1. [HTML to PNG Converter](https://htmlcsstoimage.com/)
2. [Screenshot API](https://htmlcsstoimage.com/)
3. [Browser Screenshot Tools](https://www.browserstack.com/screenshots)

### Command Line Tools
1. **Puppeteer** (Node.js)
2. **Playwright** (Node.js)
3. **wkhtmltoimage** (C++)

### Example Puppeteer Script
\`\`\`javascript
const puppeteer = require('puppeteer');
const fs = require('fs');

async function convertHTMLToPNG(htmlFile, outputFile, width, height) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  await page.goto(\`file://\${__dirname}/\${htmlFile}\`);
  await page.screenshot({ path: outputFile, type: 'png' });
  await browser.close();
}

// Convert icon
convertHTMLToPNG('public/icons/ios/icon-1024x1024-AppStore.html', 'icon-1024.png', 1024, 1024);
\`\`\`

## File Naming Convention

- Icons: \`icon-{size}x{size}-{name}.html\`
- Splash: \`splash-{width}x{height}-{name}.html\`

## Next Steps

1. Convert HTML files to PNG using your preferred tool
2. Place PNG files in the appropriate platform directories
3. Update Capacitor configuration if needed
4. Build and test your mobile app
`;

  fs.writeFileSync('public/assets-README.md', readme);
  console.log('📝 Generated assets README');
}

// Main execution
function main() {
  console.log('🚀 Starting asset generation...');
  
  createDirectories();
  generateIcons();
  generateSplashScreens();
  generateAssetsREADME();
  
  console.log('✅ Asset generation complete!');
  console.log('📖 See public/assets-README.md for conversion instructions');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  generateIcons,
  generateSplashScreens,
  generateAssetsREADME
};
