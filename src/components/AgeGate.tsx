'use client';

import { useState, useEffect } from 'react';

interface AgeGateProps {
  onAgeVerified: () => void;
}

export default function AgeGate({ onAgeVerified }: AgeGateProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already verified their age
    const hasVerified = localStorage.getItem('agreed18') === '1';
    
    if (hasVerified) {
      onAgeVerified();
    } else {
      setIsVisible(true);
    }
  }, [onAgeVerified]);

  const handleAgree = () => {
    localStorage.setItem('agreed18', '1');
    setIsVisible(false);
    onAgeVerified();
  };

  const handleDisagree = () => {
    // Redirect to a safe site or show information
    window.location.href = 'https://www.google.com';
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="age-gate-overlay">
      <div className="age-gate-modal">
        <div className="age-gate-content">
          <h2>年齢確認</h2>
          <div className="age-gate-text">
            <p>このサイトには成人向けコンテンツが含まれています。</p>
            <p>あなたは18歳以上ですか？</p>
          </div>
          <div className="age-gate-buttons">
            <button 
              className="age-gate-button agree"
              onClick={handleAgree}
            >
              はい（18歳以上）
            </button>
            <button 
              className="age-gate-button disagree"
              onClick={handleDisagree}
            >
              いいえ（18歳未満）
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}