'use client';

import { useState } from 'react';

export default function Page() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Formspreeへの送信（実際のエンドポイントに変更してください）
    try {
      const response = await fetch('https://formspree.io/f/your-form-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', type: 'inquiry', message: '' });
      }
    } catch (error) {
      console.error('送信エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="static-page">
        <div className="contact-success">
          <h1>お問い合わせ完了</h1>
          <p>お問い合わせいただき、ありがとうございます。</p>
          <p>内容を確認の上、3営業日以内にご返信いたします。</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="btn-primary"
          >
            新しいお問い合わせ
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="static-page">
      <h1>お問い合わせ</h1>
      
      <div className="contact-info">
        <p>サイトに関するお問い合わせ、コンテンツの削除依頼、その他ご質問がございましたら、下記フォームよりご連絡ください。</p>
        
        <div className="contact-types">
          <h3>お問い合わせ内容</h3>
          <ul>
            <li><strong>一般的なお問い合わせ：</strong>サイトの使い方や機能について</li>
            <li><strong>削除依頼：</strong>著作権侵害や不適切なコンテンツの報告</li>
            <li><strong>技術的な問題：</strong>サイトの表示や動作に関する問題</li>
            <li><strong>提携・広告：</strong>広告掲載や提携に関するご相談</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label htmlFor="name">お名前（必須）</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">メールアドレス（必須）</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">お問い合わせ種別</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-control"
          >
            <option value="inquiry">一般的なお問い合わせ</option>
            <option value="removal">削除依頼</option>
            <option value="technical">技術的な問題</option>
            <option value="partnership">提携・広告</option>
            <option value="other">その他</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="message">お問い合わせ内容（必須）</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="form-control"
            placeholder="詳細をお聞かせください。削除依頼の場合は、対象となるコンテンツのURLまたは詳細な説明をお書きください。"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn-primary btn-submit"
        >
          {isSubmitting ? '送信中...' : '送信'}
        </button>
      </form>

      <div className="contact-notice">
        <h3>重要事項</h3>
        <ul>
          <li>頂いたお問い合わせには3営業日以内にご返信いたします</li>
          <li>削除依頼については、正当な理由が確認でき次第、速やかに対応いたします</li>
          <li>技術的な問題については、ブラウザやデバイス情報も併せてお知らせください</li>
          <li>提携・広告に関するお問い合わせは、事前に<a href="/guidelines">掲載基準</a>をご確認ください</li>
        </ul>
      </div>
    </main>
  );
}
