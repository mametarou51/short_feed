import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import GoogleAnalytics from '@/components/GoogleAnalytics'

export const metadata: Metadata = {
  metadataBase: new URL('https://short-feed.pages.dev'),
  title: {
    default: 'ショートポルノ動画 ShortPorn | 縦スクロール無料エロ動画・人気AV女優・素人・巨乳まとめ',
    template: '%s | ShortPorn - ショートポルノ縦スクロール動画',
  },
  description: 'ショートポルノ動画サイト！YouTubeショート風の縦スクロールで無料エロ動画を連続視聴。人気AV女優、素人、巨乳、フェラチオなど豊富なジャンルの短尺ポルノを完全無料配信。縦型動画でスマホ最適化済み。',
  keywords: ['ショートポルノ', '縦スクロール動画', '無料エロ動画', 'ショート動画', 'YouTubeショート風', '縦型エロ動画', 'スマホエロ動画', 'ショートAV', '縦スクロールポルノ', 'AV動画', '無料アダルト動画', '人気AV女優', '素人動画', '巨乳動画', 'フェラチオ動画', '中出し動画', '顔射動画', '個撮動画', 'DMM動画', 'DUGA動画', 'エロサンプル動画', '無料アダルトサイト', 'エロ動画まとめ', 'アダルト動画サイト', '18禁動画', '成人動画', 'エロ動画検索', '無料AV', 'エロ動画配信', 'アダルトコンテンツ', '短尺エロ動画', 'プレビュー動画', 'ティーザー動画', '公式サンプル', 'ショートフォーム', '縦動画', 'ポートレート動画'],
  alternates: {
    languages: {
      'ja': '/',
      'x-default': '/',
    },
  },
  icons: { 
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: { 
    title: 'ショートポルノ動画 ShortPorn | 縦スクロール無料エロ動画・AV女優・素人',
    description: 'YouTubeショート風の縦スクロールでショートポルノ動画を連続視聴！人気AV女優、素人、巨乳など豊富なジャンルを縦型動画で完全無料配信。スマホ最適化済み。',
    url: 'https://short-feed.pages.dev/',
    siteName: 'ShortPorn - ショートポルノ縦スクロール動画サイト',
    locale: 'ja_JP',
    type: 'website',
    images: [
      { url: '/sample_img/240x180.jpg', width: 240, height: 180, alt: 'ShortPorn' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ショートポルノ ShortPorn | 縦スクロール無料エロ動画',
    description: 'YouTubeショート風の縦スクロールでショートポルノ動画を連続視聴！AV女優、素人、巨乳など豊富なジャンルの縦型エロ動画を毎日更新。スマホ対応。',
    images: ['/sample_img/240x180.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ShortPorn - ショートポルノ縦スクロール動画サイト',
    alternateName: 'ShortPorn',
    url: 'https://short-feed.pages.dev/',
    description: 'YouTubeショート風縦スクロールでショートポルノ動画を連続視聴！人気AV女優、素人、巨乳、フェラチオ、中出し、顔射など豊富なジャンルの短尺ポルノを縦型動画で完全無料配信。スマホ最適化済み。',
    inLanguage: 'ja',
    isFamilyFriendly: false,
    contentRating: 'R18',
    audience: { '@type': 'PeopleAudience', suggestedMinAge: '18' },
    keywords: 'ショートポルノ,縦スクロール動画,無料エロ動画,YouTubeショート風,ショート動画,縦型エロ動画,スマホエロ動画,AV動画,素人動画,巨乳動画,フェラチオ動画,中出し動画,顔射動画,個撮動画,DMM動画,DUGA動画',
    mainEntity: {
      '@type': 'VideoGallery',
      name: 'ショートポルノ縦スクロール動画ギャラリー',
      description: 'YouTubeショート風縦スクロールで視聴できるショートポルノ動画コレクション'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://short-feed.pages.dev/?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'ShortPorn',
      url: 'https://short-feed.pages.dev/'
    }
  }

  return (
    <html lang="ja">
      <head>
        {/* 成人向けサイトであることの明示 */}
        {/* 成人向けコンテンツ最適化設定 */}
        <meta name="rating" content="adult" />
        <meta name="RATING" content="RTA-5042-1996-1400-1577-RTA" />
        <meta name="content-rating" content="mature" />
        <meta name="audience" content="adult" />
        {/* JuicyAds サイト認証 */}
        <meta name="juicyads-site-verification" content="4f146c13e184d12bf7a1249f874cc53c" />
        {/* パフォーマンス最適化 */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
        {/* SEO最適化されたconnection hintsとリソースプリロード */}
        <link rel="preconnect" href="https://www.dmm.co.jp" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//www.dmm.co.jp" />
        <link rel="preconnect" href="https://pics.dmm.co.jp" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//pics.dmm.co.jp" />
        <link rel="preconnect" href="https://ad.duga.jp" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//ad.duga.jp" />
        <link rel="preconnect" href="https://click.duga.jp" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//click.duga.jp" />
        {/* アイコン設定 */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <meta name="theme-color" content="#FF6B9D" />
        
        {/* 重要なリソースのプリロード */}
        <link rel="preload" href="/videos.json" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/sample_img/240x180.jpg" as="image" />
        {/* フォントプリロード（ある場合） */}
        {/* <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossOrigin /> */}
        {/* 構造化データ */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
        {/* Google Analytics */}
        <GoogleAnalytics GA_MEASUREMENT_ID="G-XXXXXXXXXX" />
      </head>
      <body className="layout-body">
        <header className="site-header">
          <nav className="site-nav">
            <Link href="/" className="site-logo">ShortPorn</Link>
            <div className="nav-links">
              <Link href="/about" className="nav-link">このサイトについて</Link>
              <Link href="/guidelines" className="nav-link">掲載基準</Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div>© {new Date().getFullYear()} ShortPorn</div>
          <div className="footer-links">
            <Link href="/terms" className="footer-link">利用規約</Link>
            <Link href="/privacy" className="footer-link">プライバシー</Link>
            {/* <Link href="/contact" className="footer-link">連絡窓口</Link> */}
          </div>
          <div className="footer-disclaimer">※本サイトは提携先の公式素材のみを紹介し、著作権を尊重します。</div>
        </footer>
      </body>
    </html>
  )
}