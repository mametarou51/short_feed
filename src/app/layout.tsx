import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Short Videos',
  description: 'Vertical scrolling short video experience',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}