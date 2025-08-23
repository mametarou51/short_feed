export default function Page() {
  return (
    <main className="static-page">
      <h1>お問い合わせ</h1>
      <p>以下のフォームよりお問い合わせください。権利侵害の申し立ては作品名・該当箇所のURLを明記してください。迅速に対応します。</p>
      
      <form action="https://formspree.io/f/your-form-id" method="POST" className="contact-form">
        <label className="form-label">
          メールアドレス
          <input 
            name="email" 
            type="email" 
            required 
            className="form-input"
          />
        </label>
        
        <label className="form-label">
          お問い合わせ内容
          <textarea 
            name="message" 
            rows={6} 
            required 
            className="form-textarea"
          />
        </label>
        
        <button type="submit" className="form-button">
          送信
        </button>
      </form>
      
      <div className="info-box">
        <h3>権利侵害の申し立てについて</h3>
        <p>権利侵害の申し立ては以下の情報を明記してください：</p>
        <ul>
          <li>権利者であることを証明する情報</li>
          <li>該当するコンテンツのURL</li>
          <li>侵害内容の詳細</li>
          <li>連絡先情報</li>
        </ul>
        <p>確認次第、迅速に対応いたします。</p>
      </div>
    </main>
  );
}
