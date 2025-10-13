// Logo Optimization Script
// Run with: node optimize-logo.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeLogo() {
  const inputPath = path.join(__dirname, 'public', 'logo.png');
  const outputPath48 = path.join(__dirname, 'public', 'logo-48.png');
  const outputPathWebP = path.join(__dirname, 'public', 'logo-48.webp');

  try {
    // Check if sharp is installed
    console.log('📦 Optimizing logo.png...\n');

    // Create 48x48 PNG (2x for retina 24x24)
    await sharp(inputPath)
      .resize(48, 48, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outputPath48);

    const png48Size = fs.statSync(outputPath48).size;
    console.log(`✅ Created logo-48.png (${(png48Size / 1024).toFixed(1)} KB)`);

    // Create 48x48 WebP (even smaller)
    await sharp(inputPath)
      .resize(48, 48, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .webp({ quality: 90 })
      .toFile(outputPathWebP);

    const webpSize = fs.statSync(outputPathWebP).size;
    console.log(`✅ Created logo-48.webp (${(webpSize / 1024).toFixed(1)} KB)`);

    const originalSize = fs.statSync(inputPath).size;
    const savings = originalSize - Math.min(png48Size, webpSize);
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

    console.log(`\n📊 Results:`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`   Optimized: ${(Math.min(png48Size, webpSize) / 1024).toFixed(1)} KB`);
    console.log(`   Savings: ${(savings / 1024).toFixed(1)} KB (${savingsPercent}%)\n`);

    console.log('🎯 Next steps:');
    console.log('   1. Update components to use logo-48.webp');
    console.log('   2. Delete or backup the original logo.png\n');

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('❌ Error: sharp is not installed\n');
      console.log('📦 Install sharp with:');
      console.log('   npm install sharp --save-dev\n');
      console.log('Or use online tool:');
      console.log('   1. Go to https://squoosh.app');
      console.log('   2. Upload public/logo.png');
      console.log('   3. Resize to 48x48');
      console.log('   4. Export as WebP (quality 90)');
      console.log('   5. Save as public/logo-48.webp\n');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

optimizeLogo();
