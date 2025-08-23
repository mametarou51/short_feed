了解。エンジニアリングLLMにそのまま渡せるよう、独立・完結・検証可能なタスクに刻んだよ。
各タスクは「目的 / 作業内容 / 完了条件 / テスト手順」で統一。

⸻

0. リポジトリ初期化

T0-1: Next.js プロジェクト生成
	•	目的: 最小アプリの土台を作る
	•	作業: create-next-app --ts --app で新規作成
	•	完了条件: npm run dev でトップが 200 を返す
	•	テスト: ブラウザで http://localhost:3000 を開き、初期ページ表示

T0-2: 依存追加（hls.js など）
	•	目的: HLS 再生に必要な依存を導入
	•	作業: npm i hls.js を実行
	•	完了条件: package.json の dependencies に hls.js が記録
	•	テスト: npm ls hls.js が 1 つの解決で成功

T0-3: ベーシックLint/Format 設定
	•	目的: フォーマット揺れ防止
	•	作業: ESLint/Prettier の設定ファイル追加（既定でOK）
	•	完了条件: npm run lint がエラー0
	•	テスト: 任意ファイルでフォーマット乱れを作り、npm run lint で検出→修正

⸻

1. データ供給（静的JSON）

T1-1: videos.json 追加
	•	目的: 初期表示用動画メタを配信
	•	作業: /public/videos.json を作成（サンプル1件以上）
	•	完了条件: GET /videos.json が 200 と有効JSON
	•	テスト: curl localhost:3000/videos.json | jq . が成功

T1-2: JSON スキーマ検証
	•	目的: videos.json の構造保証
	•	作業: Zod 等で id/title/posterUrl/videoUrl/offer{name,url} を検証（fetch後）
	•	完了条件: 不正データ時にUIでユーザ向けエラーブロック表示
	•	テスト: videos.json のキーを壊して 400/エラー表示になる

⸻

2. 縦スク UI（クライアント）

T2-1: 全画面縦スナップのレイアウト
	•	目的: ショート風の縦スクを実現
	•	作業: page.tsx に snap-y snap-mandatory の1セクション1動画構成を実装
	•	完了条件: スクロールでセクションがピタッと止まる
	•	テスト: モバイルエミュレータで 3 セクション以上のスナップ挙動を目視確認

T2-2: IntersectionObserver による自動再生/停止
	•	目的: ビューポート IN で再生、OUT で停止
	•	作業: しきい値 0.7 の IO を Video コンポーネントに実装
	•	完了条件: 隣の動画にスクロールすると前の動画が停止
	•	テスト: ネットワーク遅延 (Slow 3G) で挙動が安定することを確認

T2-3: HLS 再生の動的ロード
	•	目的: 非Safari で .m3u8 を再生
	•	作業: hls.js を必要時のみ dynamic import、ネイティブ対応時は未使用
	•	完了条件: Chrome(Windows/Android) で .m3u8 が再生
	•	テスト: videoUrl が .m3u8 と .mp4 の両方で再生成功

T2-4: コントロール非表示＋ミュート自動再生
	•	目的: ショート体験の再現
	•	作業: controls なし、muted loop playsInline を設定
	•	完了条件: 初回から自動再生（ミュート）
	•	テスト: iOS Safari で自動再生することを確認

T2-5: 画面下オーバーレイとCTA
	•	目的: 可読性と誘導最適化
	•	作業: 下部グラデーション、offer.name、タイトル、CTA「本編へ」ボタン
	•	完了条件: 明るい/暗い動画でも文字が読める
	•	テスト: Lighthouse のコントラスト検査合格（または手動目視）

⸻

3. クリック誘導（/go）

T3-1: Cloudflare Workers プロジェクト作成
	•	目的: /go/:id エンドポイントを用意
	•	作業: wrangler 初期化、エントリ workers/go.js 追加
	•	完了条件: wrangler dev でローカル起動
	•	テスト: GET /go/test が 302 or “/” へ

T3-2: KV バインド作成とデータ投入
	•	目的: id→アフィURL の解決
	•	作業: wrangler kv:namespace create VIDEOS、wrangler kv:key put でキー投入
	•	完了条件: VIDEOS.get(id) で JSON が取得できる
	•	テスト: wrangler kv:key get --binding=VIDEOS v1 が期待値を返す

T3-3: 302 リダイレクト実装
	•	目的: 高速な誘導
	•	作業: KV で URL 解決後、Response.redirect(offer.url, 302)
	•	完了条件: /go/v1 でアフィURLに遷移
	•	テスト: ブラウザで手動、DevTools の Network で 302 を確認

T3-4: 非同期ログ送信（waitUntil）
	•	目的: クリックイベントを解析に送信
	•	作業: ctx.waitUntil(fetch(PLAUSIBLE_ENDPOINT,{...})) を実装
	•	完了条件: リダイレクトがブロックされずイベントが送信
	•	テスト: Workers ログ/ネットワークでイベント POST が記録される

T3-5: 同一/別ドメイン配信の切替
	•	目的: 運用選択肢の確保
	•	作業: 別ドメイン（go.example.com）/ 同一ドメイン（Pages Functions）両対応のルーティング案内を README に記述
	•	完了条件: どちらの配信形態でもリンクが機能
	•	テスト: 本番想定ドメインでの 302 をブラウザ確認

⸻

4. 解析（Plausible）

T4-1: サイト登録と環境変数設定
	•	目的: イベント受信先の準備
	•	作業: PLAUSIBLE_ENDPOINT と PLAUSIBLE_DOMAIN を Workers Vars へ
	•	完了条件: wrangler.toml に vars 設定が存在
	•	テスト: wrangler deploy 後、Workers 側で vars が参照できる

T4-2: click_out イベント送信仕様確定
	•	目的: 後続ダッシュボードの整合性
	•	作業: name(url, props{videoId,country,ua}) のペイロード仕様をドキュメント化
	•	完了条件: README に項目定義
	•	テスト: ダッシュボードで videoId 別の集計が表示される

⸻

5. 年齢ソフトゲート

T5-1: 初回自己申告モーダル実装
	•	目的: MVP の最低限の年齢確認
	•	作業: 初回のみモーダル表示、同意で localStorage.agreed18=1
	•	完了条件: 一度同意すると再訪時に表示されない
	•	テスト: localStorage を消すと再度表示される

T5-2: ゲート未同意時の保護
	•	目的: 未同意状態での視聴を抑止
	•	作業: 未同意の間は動画要素をレンダーしない/ブラーを掛ける
	•	完了条件: モーダル閉鎖まで再生が始まらない
	•	テスト: 同意前に Network に動画取得が走らないことを確認

⸻

6. bunny.net（動画）

T6-1: Video ライブラリ作成 & HLS URL 取得
	•	目的: 安定した配信元の確保
	•	作業: ティーザー動画をアップロード、HLS を有効化
	•	完了条件: .m3u8 の再生URLを取得
	•	テスト: 直URLをブラウザで開き、プレイリスト/セグメントが取得できる

T6-2: poster とビットレート設定
	•	目的: 初速と軽量性の最適化
	•	作業: 360p/540p を最低用意、poster を videos.json に設定
	•	完了条件: 低速回線で初動 1–2 秒程度で開始
	•	テスト: DevTools Slow 3G で開始遅延とバッファを確認

⸻

7. デプロイ/配信

T7-1: フロントのデプロイ（Pages or Vercel）
	•	目的: 一般アクセス可能にする
	•	作業: CI もしくは CLI で本番デプロイ
	•	完了条件: 本番URLでトップが 200
	•	テスト: curl -I https://<prod-domain> が 200 を返す

T7-2: Workers デプロイ
	•	目的: /go エンドポイントを公開
	•	作業: wrangler deploy、独自ドメイン（任意）を割当
	•	完了条件: https://go.<domain>/go/<id> が 302
	•	テスト: ブラウザで実遷移、Plausible にイベントが乗る

T7-3: CORS/混在コンテンツ確認
	•	目的: ドメイン跨ぎの不具合回避
	•	作業: フロント(https)・動画CDN(https)・Workers(https) で混在なし確認
	•	完了条件: ブラウザ警告ゼロ
	•	テスト: DevTools Console にエラーが無い

⸻

8. アクセシビリティ/パフォーマンス

T8-1: メタ/viewport/manifest の最小設定
	•	目的: モバイル体験のベース
	•	作業: layout.tsx に meta/viewport を設定
	•	完了条件: モバイルでレイアウト崩れなし
	•	テスト: iOS/Android エミュで確認

T8-2: Lighthouse チェック（PWA でなくてOK）
	•	目的: 主要指標の可視化
	•	作業: Perf/Best Practices/SEO/Accessibility を計測
	•	完了条件: 主要スコアが初期値より改善（基準は README に明記）
	•	テスト: レポートスクショを保存

⸻

9. セキュリティ/リーガル最小

T9-1: 直リンク防止（任意）
	•	目的: アフィ URL の直接露出抑止
	•	作業: UIからは常に /go/:id のみを使う
	•	完了条件: DOM/ネットワークに生URLが出ない
	•	テスト: Elements/Network で確認

T9-2: フッターに ToS/連絡窓口のダミーリンク
	•	目的: 通報/削除フロー入口の明示
	•	作業: テキストリンクのみ（後で本文差し替え）
	•	完了条件: フッターに「お問い合わせ/ガイドライン」リンク表示
	•	テスト: 404でなく開く（プレースホルダOK）

⸻

10. ドキュメント

T10-1: README（セットアップ/デプロイ/運用）
	•	目的: 手順の単一情報源
	•	作業: ローカル起動→動画登録→Workers→デプロイ→計測確認までを記述
	•	完了条件: README だけで新人が環境を再現できる
	•	テスト: 手元のクリーン環境で再現テスト

T10-2: イベント仕様書（解析連携）
	•	目的: ダッシュボード連携の誤差防止
	•	作業: click_out の項目/型/サンプル JSON を記載
	•	完了条件: 解析側が仕様だけで取込設定できる
	•	テスト: 仕様書通りの POST を送ってダッシュボード反映を確認

⸻

追加の小粒（必要なら）
	•	T-EX1: 404/エラーページ整備（ユーザー体験保護）
	•	T-EX2: モバイルスワイプの慣性調整（CSS scroll-snap-stop など）
	•	T-EX3: 最低限のユニットテスト（動画カードの表示・CTAリンク存在）

⸻

この順で踏めば、どのタスクも単体で着手・検証できる。
次は「ジオ分岐（国別でアフィURL出し分け）」まで入れるかどうか決めよう。必要なら、そのまま同じ形式で追加するよ。