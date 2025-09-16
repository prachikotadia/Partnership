# App Assets

This directory contains generated HTML templates for app icons and splash screens.

## Icons

### iOS Icons
- Use the HTML files in `icons/ios/` to generate PNG files
- Convert to PNG using a tool like:
  - [HTML to PNG Converter](https://htmlcsstoimage.com/)
  - [Screenshot API](https://htmlcsstoimage.com/)
  - Browser screenshot tools

### Android Icons
- Use the HTML files in `icons/android/` to generate PNG files
- Convert to PNG using the same tools as iOS

## Splash Screens

### iOS Splash Screens
- Use the HTML files in `splash/ios/` to generate PNG files
- Convert to PNG using the same tools as icons

### Android Splash Screens
- Use the HTML files in `splash/android/` to generate PNG files
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
```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');

async function convertHTMLToPNG(htmlFile, outputFile, width, height) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  await page.goto(`file://${__dirname}/${htmlFile}`);
  await page.screenshot({ path: outputFile, type: 'png' });
  await browser.close();
}

// Convert icon
convertHTMLToPNG('public/icons/ios/icon-1024x1024-AppStore.html', 'icon-1024.png', 1024, 1024);
```

## File Naming Convention

- Icons: `icon-{size}x{size}-{name}.html`
- Splash: `splash-{width}x{height}-{name}.html`

## Next Steps

1. Convert HTML files to PNG using your preferred tool
2. Place PNG files in the appropriate platform directories
3. Update Capacitor configuration if needed
4. Build and test your mobile app
