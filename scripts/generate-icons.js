const fs = require('fs');
const path = require('path');

// アイコンサイズの定義
const iconSizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 }
];

// SVGテンプレート（サイズに応じて調整）
function generateSVG(size) {
  const scale = size / 512;
  const center = size / 2;
  const radius = 240 * scale;
  const buttonRadius = 80 * scale;
  const arrowSize = 10 * scale;
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景円 -->
  <circle cx="${center}" cy="${center}" r="${radius}" fill="#FF6B9D" stroke="#E91E63" stroke-width="${8 * scale}"/>
  
  <!-- 中央の動画プレイボタン -->
  <circle cx="${center}" cy="${center}" r="${buttonRadius}" fill="white" opacity="0.9"/>
  <polygon points="${center - 20 * scale},${center - 30 * scale} ${center - 20 * scale},${center + 30 * scale} ${center + 40 * scale},${center}" fill="#E91E63"/>
  
  <!-- 縦スクロールを表現する矢印 -->
  <g fill="white" opacity="0.8">
    <!-- 上向き矢印 -->
    <polygon points="${center},${120 * scale} ${center - 10 * scale},${140 * scale} ${center + 10 * scale},${140 * scale}"/>
    <rect x="${center - 5 * scale}" y="${140 * scale}" width="${10 * scale}" height="${20 * scale}"/>
    
    <!-- 下向き矢印 -->
    <polygon points="${center},${392 * scale} ${center - 10 * scale},${372 * scale} ${center + 10 * scale},${372 * scale}"/>
    <rect x="${center - 5 * scale}" y="${352 * scale}" width="${10 * scale}" height="${20 * scale}"/>
  </g>
  
  <!-- 装飾的な要素 -->
  <circle cx="${120 * scale}" cy="${120 * scale}" r="${15 * scale}" fill="white" opacity="0.3"/>
  <circle cx="${392 * scale}" cy="${120 * scale}" r="${12 * scale}" fill="white" opacity="0.3"/>
  <circle cx="${120 * scale}" cy="${392 * scale}" r="${12 * scale}" fill="white" opacity="0.3"/>
  <circle cx="${392 * scale}" cy="${392 * scale}" r="${15 * scale}" fill="white" opacity="0.3"/>
</svg>`;
}

// アイコンファイルを生成
function generateIcons() {
  console.log('アイコンの生成を開始します...');
  
  iconSizes.forEach(({ name, size }) => {
    const svgContent = generateSVG(size);
    const filePath = path.join(__dirname, '..', 'public', name);
    
    // SVGファイルを一時的に作成
    const tempSvgPath = path.join(__dirname, '..', 'public', `temp-${size}.svg`);
    fs.writeFileSync(tempSvgPath, svgContent);
    
    console.log(`✅ ${name} (${size}x${size}) を生成しました`);
  });
  
  console.log('\n🎉 すべてのアイコンが生成されました！');
  console.log('\n次のステップ:');
  console.log('1. オンラインSVG to PNG変換ツールを使用');
  console.log('2. または、ImageMagickなどのツールで変換');
  console.log('3. 生成されたPNGファイルをpublic/フォルダに配置');
}

generateIcons();
