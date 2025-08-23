import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '掲載基準',
  description: 'Short Feed のコンテンツ掲載基準。公式サンプル素材のみの掲載、権利保護、年齢制限などの方針を説明します。',
}

export default function Page() {
  return (
    <main className="static-page">
      <h1>掲載基準</h1>
      <ul>
        <li>提携先（例：FANZA/DMM 等）が提供する公式サンプル・プロモ素材のみ掲載。</li>
        <li>出典の明示：カード内に提供元名を表示。</li>
        <li>苦情・権利侵害の申し立てがあった場合は、確認次第すみやかに対応・削除します。</li>
      </ul>
      <p>不適切な素材・無断転載の疑いがあるものは掲載しません。</p>
      
      <h2>コンテンツ選定基準</h2>
      <ul>
        <li>公式ティーザー・サンプル動画に限定</li>
        <li>権利者から正式に許可された素材</li>
        <li>適切な年齢制限の実施</li>
        <li>法的コンプライアンスの遵守</li>
      </ul>

      <h2>削除申請について</h2>
      <p>権利者の方で削除を希望される場合は、以下の情報をお問い合わせページよりお送りください：</p>
      <ul>
        <li>権利者であることを証明する資料</li>
        <li>削除対象となるコンテンツのURL</li>
        <li>削除理由</li>
      </ul>
      <p>確認次第、迅速に対応いたします。</p>
    </main>
  );
}
