import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  metadataBase: new URL('https://short-feed.pages.dev'),
  title: {
    default: 'Short Feed',
    template: '%s | Short Feed',
  },
  description: '短尺ティーザーを集めたリンクメディア',
  keywords: ['短尺', 'ティーザー', 'リンクメディア', '公式サンプル'],
  alternates: {
    languages: {
      'ja': '/',
      'x-default': '/',
    },
  },
  icons: { icon: "/favicon.ico" },
  openGraph: { 
    title: 'Short Feed',
    description: '短尺ティーザーまとめ',
    url: 'https://short-feed.pages.dev',
    siteName: 'Short Feed',
    locale: 'ja_JP',
    type: 'website',
    images: [
      { url: '/sample_img/240x180.jpg', width: 240, height: 180, alt: 'Short Feed' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Short Feed',
    description: '短尺ティーザーまとめ',
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
    name: 'Short Feed',
    url: 'https://short-feed.pages.dev',
    description: '短尺ティーザーを集めたリンクメディア',
    inLanguage: 'ja',
    isFamilyFriendly: false,
    contentRating: 'R18',
    audience: { '@type': 'PeopleAudience', suggestedMinAge: '18' },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://short-feed.pages.dev/?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <html lang="ja">
      <head>
        {/* 成人向けサイトであることの明示 */}
        <meta name="rating" content="adult" />
        <meta name="RATING" content="RTA-5042-1996-1400-1577-RTA" />
        {/* connection hints */}
        <link rel="preconnect" href="https://www.dmm.co.jp" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//www.dmm.co.jp" />
        <link rel="preconnect" href="https://pics.dmm.co.jp" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//pics.dmm.co.jp" />
        <link rel="preconnect" href="https://ad.duga.jp" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//ad.duga.jp" />
        <link rel="preconnect" href="https://click.duga.jp" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//click.duga.jp" />
        {/* 構造化データ */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
      </head>
      <body className="layout-body">
        <header className="site-header">
          <nav className="site-nav">
            <Link href="/" className="site-logo">Short Feed</Link>
            <div className="nav-links">
              <Link href="/about" className="nav-link">このサイトについて</Link>
              <Link href="/guidelines" className="nav-link">掲載基準</Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div>© {new Date().getFullYear()} Short Feed</div>
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