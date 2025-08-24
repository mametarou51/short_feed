const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 変換対象のSVGファイル
const svgFiles = [
  { input: 'temp-16.svg', output: 'favicon-16x16.png', size: 16 },
  { input: 'temp-32.svg', output: 'favicon-32x32.png', size: 32 },
  { input: 'temp-48.svg', output: 'favicon-48x48.png', size: 48 },
  { input: 'temp-180.svg', output: 'apple-touch-icon.png', size: 180 },
  { input: 'temp-192.svg', output: 'android-chrome-192x192.png', size: 192 },
  { input: 'temp-512.svg', output: 'android-chrome-512x512.png', size: 512 }
];

async function convertSVGToPNG() {
  console.log('SVG to PNG変換を開始します...');
  
  const publicDir = path.join(__dirname, '..', 'public');
  
  for (const file of svgFiles) {
    try {
      const inputPath = path.join(publicDir, file.input);
      const outputPath = path.join(publicDir, file.output);
      
      // SVGをPNGに変換
      await sharp(inputPath)
        .resize(file.size, file.size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${file.output} (${file.size}x${file.size}) を生成しました`);
      
      // 一時的なSVGファイルを削除
      fs.unlinkSync(inputPath);
      console.log(`🗑️  ${file.input} を削除しました`);
      
    } catch (error) {
      console.error(`❌ ${file.output} の生成に失敗しました:`, error.message);
    }
  }
  
  console.log('\n🎉 すべてのPNGアイコンが生成されました！');
}

convertSVGToPNG().catch(console.error);
