"use client";
import { useEffect, useRef } from 'react';

interface JuicyAdsProps {
  adZone: string;
  width: number;
  height: number;
}

export default function JuicyAdsComponent({ adZone, width, height }: JuicyAdsProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current || !adRef.current) return;

    // JuicyAds スクリプトの動的読み込み
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://poweredby.jads.co/js/jads.js';
    script.setAttribute('data-cfasync', 'false');
    
    // 広告要素を作成
    const insElement = document.createElement('ins');
    insElement.id = adZone;
    insElement.setAttribute('data-width', width.toString());
    insElement.setAttribute('data-height', height.toString());
    
    // 広告初期化スクリプト
    const initScript = document.createElement('script');
    initScript.type = 'text/javascript';
    initScript.setAttribute('data-cfasync', 'false');
    initScript.async = true;
    initScript.innerHTML = `
      (adsbyjuicy = window.adsbyjuicy || []).push({'adzone':${adZone}});
    `;

    // DOM に追加
    if (adRef.current) {
      adRef.current.appendChild(script);
      adRef.current.appendChild(insElement);
      adRef.current.appendChild(initScript);
      hasLoaded.current = true;
    }

    return () => {
      // クリーンアップ
      hasLoaded.current = false;
    };
  }, [adZone, width, height]);

  return (
    <div className="card ad-container juicy-ads" style={{ 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center', 
      backgroundColor: '#000',
      minHeight: `${height}px`,
      width: '100%'
    }}>
      <div ref={adRef} style={{ width: `${width}px`, height: `${height}px` }} />
    </div>
  );
}