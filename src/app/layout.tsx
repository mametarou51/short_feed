import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Short Feed',
  description: '短尺ティーザーを集めたリンクメディア',
  icons: { icon: "/favicon.ico" },
  openGraph: { 
    title: "Short Feed", 
    description: "短尺ティーザーまとめ", 
    url: "https://short-feed.pages.dev" 
  }
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
  return (
    <html lang="ja">
      <body className="layout-body">
        <header className="site-header">
          <nav className="site-nav">
            <Link href="/" className="site-logo">Short Feed</Link>
            <div className="nav-links">
              <Link href="/about" className="nav-link">このサイトについて</Link>
              <Link href="/guidelines" className="nav-link">掲載基準</Link>
              <Link href="/contact" className="nav-link">お問い合わせ</Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div>© {new Date().getFullYear()} Short Feed</div>
          <div className="footer-links">
            <Link href="/terms" className="footer-link">利用規約</Link>
            <Link href="/privacy" className="footer-link">プライバシー</Link>
            <Link href="/contact" className="footer-link">連絡窓口</Link>
          </div>
          <div className="footer-disclaimer">※本サイトは提携先の公式素材のみを紹介し、著作権を尊重します。</div>
        </footer>
      </body>
    </html>
  )
}