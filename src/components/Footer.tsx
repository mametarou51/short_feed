'use client';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="/terms" className="footer-link">利用規約</a>
          <a href="/privacy" className="footer-link">プライバシーポリシー</a>
          <a href="/contact" className="footer-link">お問い合わせ</a>
          <a href="/dmca" className="footer-link">DMCA</a>
        </div>
        <div className="footer-text">
          <p>18歳未満の方はご利用いただけません。</p>
          <p>&copy; 2024 Short Video Site. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}