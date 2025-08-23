const fs = require('fs');
const path = require('path');

const videosPath = path.join(__dirname, '../public/videos.json');
const videos = JSON.parse(fs.readFileSync(videosPath, 'utf8'));

// 実際のDMMタグセット
const realisticTags = [
  ["制服", "学生服", "JK"],
  ["巨乳", "爆乳", "美乳"],
  ["競泳・スクール水着", "水着", "ビキニ"],
  ["マッサージ・リフレ", "エステ", "回春"],
  ["人妻", "熟女", "お母さん"],
  ["OL", "秘書", "女教師"],
  ["ナース", "CA", "メイド"],
  ["痴女", "淫語", "手コキ"],
  ["3P・4P", "乱交", "ハーレム"],
  ["中出し", "顔射", "ごっくん"],
  ["フェラ", "パイズリ", "手コキ"],
  ["アナル", "2穴", "玩具"],
  ["SM", "拘束", "調教"],
  ["レズ", "百合", "女同士"],
  ["素人", "ナンパ", "企画"],
  ["ドラマ", "ストーリー", "シリーズ"],
  ["ベスト・総集編", "4時間以上", "大量"],
  ["VR", "主観", "POV"],
  ["ローション・オイル", "ぬるぬる", "マット"],
  ["コスプレ", "女性向け", "カップル"]
];

const realisticGenres = [
  ["amateur", "pickup"], // 素人・ナンパ
  ["uniform", "schoolgirl"], // 制服・JK
  ["busty", "big_breasts"], // 巨乳
  ["mature", "milf"], // 人妻・熟女
  ["office", "secretary"], // OL・秘書
  ["cosplay", "roleplay"], // コスプレ
  ["massage", "spa"], // マッサージ
  ["group", "threesome"], // 複数プレイ
  ["creampie", "facial"], // 中出し・顔射
  ["fetish", "bdsm"], // フェチ・SM
  ["lesbian", "yuri"], // レズ
  ["drama", "story"], // ドラマ
  ["compilation", "best"], // ベスト
  ["vr", "pov"], // VR・主観
  ["oil", "lotion"] // ローション
];

const updatedVideos = videos.map((video, index) => {
  const tagIndex = index % realisticTags.length;
  const genreIndex = index % realisticGenres.length;
  
  return {
    ...video,
    attributes: {
      ...video.attributes,
      genre: realisticGenres[genreIndex],
      tags: realisticTags[tagIndex]
    }
  };
});

fs.writeFileSync(videosPath, JSON.stringify(updatedVideos, null, 2));
console.log(`Updated ${updatedVideos.length} videos with realistic DMM tags`);