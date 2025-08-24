const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createFaviconICO() {
  console.log('favicon.icoの生成を開始します...');
  
  const publicDir = path.join(__dirname, '..', 'public');
  const favicon16Path = path.join(publicDir, 'favicon-16x16.png');
  const favicon32Path = path.join(publicDir, 'favicon-32x32.png');
  const outputPath = path.join(publicDir, 'favicon.ico');
  
  try {
    // 16x16と32x32のPNGを読み込み
    const icon16 = await sharp(favicon16Path).raw().toBuffer();
    const icon32 = await sharp(favicon32Path).raw().toBuffer();
    
    // 簡単なICOファイルヘッダーを作成
    // ICOファイルは複雑な構造を持つため、ここでは基本的な構造のみ
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // Reserved
    header.writeUInt16LE(1, 2); // Type (1 = ICO)
    header.writeUInt16LE(2, 4); // Number of images
    
    // 16x16エントリ
    const entry16 = Buffer.alloc(16);
    entry16.writeUInt8(16, 0); // Width
    entry16.writeUInt8(16, 1); // Height
    entry16.writeUInt8(0, 2); // Color count
    entry16.writeUInt8(0, 3); // Reserved
    entry16.writeUInt16LE(1, 4); // Color planes
    entry16.writeUInt16LE(32, 6); // Bits per pixel
    entry16.writeUInt32LE(icon16.length, 8); // Size
    entry16.writeUInt32LE(22, 12); // Offset
    
    // 32x32エントリ
    const entry32 = Buffer.alloc(16);
    entry32.writeUInt8(32, 0); // Width
    entry32.writeUInt8(32, 1); // Height
    entry32.writeUInt8(0, 2); // Color count
    entry32.writeUInt8(0, 3); // Reserved
    entry32.writeUInt16LE(1, 4); // Color planes
    entry32.writeUInt16LE(32, 6); // Bits per pixel
    entry32.writeUInt32LE(icon32.length, 8); // Size
    entry32.writeUInt32LE(22 + icon16.length, 12); // Offset
    
    // ICOファイルを組み立て
    const icoFile = Buffer.concat([header, entry16, entry32, icon16, icon32]);
    
    // ファイルに書き込み
    fs.writeFileSync(outputPath, icoFile);
    
    console.log('✅ favicon.ico を生成しました');
    
  } catch (error) {
    console.error('❌ favicon.ico の生成に失敗しました:', error.message);
    
    // フォールバック: 16x16のPNGをコピー
    console.log('フォールバック: 16x16のPNGをfavicon.icoとしてコピーします...');
    fs.copyFileSync(favicon16Path, outputPath);
    console.log('✅ 16x16 PNGをfavicon.icoとしてコピーしました');
  }
}

createFaviconICO().catch(console.error);
