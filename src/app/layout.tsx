import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Short Feed',
  description: 'Vertical scrolling short video experience',
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
      <body style={{margin:0, background:"#000"}}>{children}</body>
    </html>
  )
}