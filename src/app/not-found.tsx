import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="not-found-page">
      <h1>404 - ページが見つかりません</h1>
      <p>お探しのページは存在しないか、移動された可能性があります。</p>
      <Link href="/" className="back-link">
        トップページに戻る
      </Link>
    </main>
  );
}
