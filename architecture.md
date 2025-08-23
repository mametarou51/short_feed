縦スク動画 × アフィリンク誘導 Web（最小構成）設計書

（修正版：Firebase依存を排し、成人可・動画向け基盤へ最適化）

⸻

0. 目的
	•	YouTubeショート風の縦スクUIで短尺ティーザー動画を連続再生。
	•	各動画カードの「本編へ」ボタンから外部アフィリエイト先へ遷移させ、CTRとEPCを最大化。
	•	初日で**体験検証（UX/CTR）**まで到達できる最小構成。

方針：ホスティング/配信/計測の停止リスクを避けるため、Firebaseは使わず、成人可かつ動画配信に適した構成へ。
コンテンツは**権利クリアなティーザー（公式サンプル・許諾済み素材）**のみを扱う。

⸻

1. スコープ（MVP）
	•	1ページのみの縦スクショートUI（全画面・スナップ・自動再生/停止）。
	•	動画メタは**静的JSON（/public/videos.json）**から読み込み。
	•	「本編へ」クリックは**Cloudflare Workersの/go/:id**へ集約 → 302リダイレクト。
	•	クリックログ送信（Plausible/自前イベントAPI）を非同期処理。
	•	最低限の年齢ソフトゲート（自己申告）をUI側に実装（後述）。

除外（MVP外）：
	•	本格DB・管理画面、強固な年齢確認ベンダ連携、レコメンド、課金、SEO最適化。

⸻

2. アーキテクチャ概要

2.1 構成図（論理）

[User]
   │
   ├─(HTTPS)─▶ Next.js Frontend (Pages/SSR or SSG) ── fetch ──▶ /public/videos.json
   │                                 │
   │                                 └────────(HLS)────────▶ bunny.net (Storage/CDN)
   │
   └─「本編へ」クリック ─▶ Cloudflare Workers: /go/:videoId
                                           │
                                           ├─ 非同期ログ送信（Plausible Event）
                                           └─ 302 Redirect ─▶ Affiliate URL

2.2 採用技術
	•	フロント：Next.js 14（App Router, TS）
	•	動画配信：bunny.net（Storage＋CDN＋HLS）
	•	クリック計測/リダイレクト：Cloudflare Workers（KV使用）
	•	解析：Plausible（自ホスト or 有料）
	•	ホスティング：Cloudflare Pages or Vercel（フロント静的配信）

⸻

3. ディレクトリ構成（最小）

project/
├── public/
│   ├── videos.json          # ティーザーのメタデータ（静的）
│   └── assets/              # 画像など
├── src/
│   └── app/
│       ├── layout.tsx
│       └── page.tsx         # 縦スクUI（Client Component）
├── workers/
│   └── go.js                # /go/:id リダイレクト＋ログ送信
├── wrangler.toml            # Workers設定（KV, 環境変数）
├── next.config.js
├── package.json
└── tsconfig.json


⸻

4. データモデル（MVPはJSON）

4.1 /public/videos.json

[
  {
    "id": "v1",
    "title": "ティーザー1",
    "posterUrl": "https://cdn.example.com/posters/v1.jpg",
    "videoUrl": "https://video.bunnycdn.com/hls/v1.m3u8",
    "offer": { "name": "FANZA", "url": "https://example.com/fanza?affid=XXXX" }
  }
]

	•	id：動画（ティーザー）識別子
	•	posterUrl：ティーザーのポスター（静止画）
	•	videoUrl：HLS（.m3u8）推奨
	•	offer：表示名とリダイレクト先（アフィURL）

将来：JSON → SQLite(Postgres)へ移行、offersや地域別出し分けルールを正規化。

⸻

5. フロントエンド仕様

5.1 動作要件
	•	全画面縦スナップ（1セクション1動画、snap-mandatory）
	•	IntersectionObserverで70%可視以上なら自動再生、外れたら停止。
	•	HLS対応：Safari等のネイティブ再生以外は hls.js を動的import。
	•	コントロールUIは非表示（controlsなし、muted/loop/playsInline）。

5.2 主要UI要素
	•	画面下部にグラデーションオーバーレイ（可読性担保）。
	•	「提供（offer.name）」→ タイトル → 「本編へ」ボタン（押しやすい幅、親指リーチ）。

5.3 年齢ソフトゲート（MVP）
	•	初回訪問時、18歳以上の自己申告ダイアログ（OKでlocalStorageにフラグ）。
	•	未成年対策・法域要件は将来の強化項目（ハードゲートやジオブロック）。

⸻

6. Cloudflare Workers 仕様（/go/:id）

6.1 役割
	•	クリックの単一点経路（計測のため集約）。
	•	KVからid→offer.urlを解決、302リダイレクト。
	•	ログ送信はwaitUntilで非同期（ユーザー体験阻害しない）。

6.2 依存
	•	KV：VIDEOS（キー＝videoId、値＝{ offer: { url } }）
	•	環境変数：PLAUSIBLE_ENDPOINT, PLAUSIBLE_DOMAIN

6.3 疑似コード（要点）

export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    const id = u.pathname.split("/").pop();
    const v = await env.VIDEOS.get(id, { type: "json" });
    if (!v) return Response.redirect(u.origin + "/", 302);

    // 非同期ログ
    const payload = {
      name: "click_out",
      url: req.headers.get("referer") ?? (u.origin + "/"),
      domain: env.PLAUSIBLE_DOMAIN,
      props: {
        videoId: id,
        country: req.headers.get("cf-ipcountry") ?? "",
        ua: req.headers.get("user-agent") ?? ""
      }
    };
    ctx.waitUntil(fetch(env.PLAUSIBLE_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(()=>{}));

    return Response.redirect(v.offer.url, 302);
  }
};

6.4 wrangler.toml（例）

name = "go-redirect"
main = "workers/go.js"
compatibility_date = "2024-12-01"

[[kv_namespaces]]
binding = "VIDEOS"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[vars]
PLAUSIBLE_ENDPOINT = "https://plausible.yourdomain.com/api/event"
PLAUSIBLE_DOMAIN = "yourdomain.com"

同一ドメインで/go/:idを使いたい場合：Cloudflare Pages Functions で同等ロジックを置く。

⸻

7. 配信・インフラ要件

7.1 動画（bunny.net）
	•	HLS出力（複数ビットレート：360p/540p推奨）。
	•	最初の3–5秒は強いティーザー部分を置く（短時間で「続き」欲求を喚起）。
	•	サムネスプライト or posterで初速表示を安定化。

7.2 フロントホスティング
	•	Cloudflare Pages or Vercel。
	•	CORS：Workersとフロントのドメイン関係に注意（基本は同一オリジン推奨）。

7.3 解析
	•	Plausibleの外部イベントAPIでclick_outを集計。
	•	将来、/view_start / scroll_next等のイベントも送信して漏斗を可視化。

⸻

8. 法務・ポリシー（運用方針）
	•	素材は権利クリア：公式ASP配布/許諾済みのティーザーのみ。無断転載は不可。
	•	未成年保護：MVPでは自己申告のソフトゲート。将来は法域に応じた年齢確認ベンダ連携やジオブロックを検討。
	•	通報/削除フロー：連絡先・削除窓口の明示、迅速な撤去手順（DMCA相当）を運用文書に用意。

ここは将来の拡張時に最初に強化する領域。収益化の持続性に直結。

⸻

9. 非機能要件
	•	速度：CLS/LCPを阻害しない軽量UI。hls.jsは必要時のみ動的ロード。
	•	可用性：リンク集約をWorkersに置き、エッジで高速・障害影響を局所化。
	•	拡張性：データ層はJSON→SQLite→Postgresへ移行しやすい形に。

⸻

10. 将来拡張（優先度順）
	1.	ページング：/videos.json?cursor= 風の分割読み込み
	2.	A/B テスト：ボタン文言・ティーザー長・オーバーレイ濃度
	3.	ジオ分岐：Workersで国別にoffer.urlを出し分け
	4.	管理UI：動画・オファーのCRUD（Next.js + SQLite/Drizzle）
	5.	強固な年齢確認：対象国のみベンダ連携＋トークン化
	6.	レコメンド：視聴ログからの類似提示（後回しでOK）

⸻

11. セットアップ手順（MVP）
	1.	Next.js

npx create-next-app@latest short_site --typescript --app
cd short_site
npm i hls.js
# /public/videos.json を配置、/src/app/page.tsx を実装

	2.	bunny.net

	•	Videoライブラリ作成 → HLS URL取得 → videos.jsonに反映。

	3.	Cloudflare Workers

# wrangler セットアップ
npm i -g wrangler
# wrangler.toml 設定 → KVバインド作成
wrangler kv:namespace create VIDEOS
# KVへデータ登録（例）
wrangler kv:key put --binding=VIDEOS v1 '{"offer":{"url":"https://example.com/fanza?affid=XXXX"}}'
# デプロイ
wrangler deploy

	4.	Plausible

	•	サイト登録 → PLAUSIBLE_ENDPOINT/PLAUSIBLE_DOMAIN 設定
	•	Workersからの外部イベントを受信できることを確認。

⸻

12. 受け入れ基準（MVP Doneの定義）
	•	スマホで縦スク→動画が自動再生/停止し、1タップで本編へ（302遷移）。
	•	click_outイベントがPlausibleで集計できる。
	•	体験がカクつかず、最初の表示が1秒以内に始動（回線次第）。
	•	年齢ソフトゲートが初回のみ表示され、再訪はスキップ。

⸻

13. リスクと回避
	•	素材権利：必ず公式サンプル・許諾素材のみ。契約とログを保管。
	•	停止リスク：成人不可な基盤に置かない。Workers/Pages＋bunny構成を遵守。
	•	計測欠損：/go経由を徹底し、直接リンク露出を避ける（UIとコードレビュー）。

⸻

まとめ
	•	UIの肝（縦スク×自動再生×明確CTA）はそのままに、止まらない基盤へ差し替え。
	•	まずはCTRの実測を取り、勝ちパターンが見えたらジオ分岐・A/B・年齢確認を段階投入。
	•	これで「1日で雛形 → 実測」まで持っていける設計になってる。

次は 年齢ソフトゲートのUI と Pages Functionsでの同一ドメイン/go/:id 版の雛形、どっちを先に出そうか。