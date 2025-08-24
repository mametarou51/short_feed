"use client";
import { useRef, useEffect } from "react";
import { Video } from '@/types/video';

type UserBehavior = {
  videoId: string;
  action: 'view' | 'skip' | 'complete' | 'click';
  duration?: number;
  timestamp: number;
};

type Props = {
  video: Video;
  onUserAction: (behavior: UserBehavior, video: Video) => void;
};

export default function DugaEmbedCard({ video, onUserAction }: Props) {
  const playerRef = useRef<HTMLDivElement>(null);

  // DUGAプレイヤー読み込み
  useEffect(() => {
    if (playerRef.current) {
      const container = playerRef.current;
      
      // プレイヤー用のHTML構造を作成
      const playerId = `dugaflvplayer-${video.id}`;
      container.innerHTML = `
        <div id="${playerId}" 
             data-w="540" 
             data-h="300" 
             data-o="${playerId}" 
             data-l="ppv" 
             data-p="${video.id}" 
             data-a="48475" 
             data-b="01"
             style="width: 100%; height: 100%; min-height: 300px;">
          <a href="${video.offer.url}" target="_blank">${video.title}</a>
        </div>
      `;
      
      console.log(`Created player div for ${video.id}:`, container.innerHTML);
      
      // 既存のスクリプトをチェック
      const existingScript = document.querySelector('script[src="https://ad.duga.jp/flash/dugaflvplayer.js"]');
      
      if (!existingScript) {
        // プレイヤー用スクリプトを読み込み
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://ad.duga.jp/flash/dugaflvplayer.js';
        script.onload = () => {
          // スクリプト読み込み後、プレイヤーを初期化
          setTimeout(() => {
            if (typeof (window as any).initDugaAdMovie === 'function') {
              console.log('Initializing DUGA player...');
              try {
                (window as any).initDugaAdMovie();
              } catch (error) {
                console.error('DUGA player initialization error:', error);
              }
            } else {
              console.warn('initDugaAdMovie function not found');
            }
          }, 500);
        };
        script.onerror = () => {
          console.error('Failed to load DUGA player script');
        };
        document.head.appendChild(script);
      } else {
        // スクリプトが既に存在する場合は直接初期化を試行
        setTimeout(() => {
          if (typeof (window as any).initDugaAdMovie === 'function') {
            console.log('Re-initializing existing DUGA player...');
            try {
              (window as any).initDugaAdMovie();
            } catch (error) {
              console.error('DUGA player re-initialization error:', error);
            }
          }
        }, 500);
      }
      
      onUserAction({
        videoId: video.id,
        action: 'view',
        timestamp: Date.now()
      }, video);
      
      return () => {
        // クリーンアップ（コンテナのみ）
        container.innerHTML = '';
      };
    }
  }, [video.id, video.offer.url, video.title, onUserAction]);

  return (
    <section className="card" aria-label={video.title}>
      <div className="video-container" style={{position: 'relative'}}>        
        {/* プレイヤー表示 */}
        <div 
          ref={playerRef}
          className="duga-video-container"
          style={{
            width: '100%', 
            height: '100%', 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            zIndex: 1,
            backgroundColor: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </div>

      <div className="card-footer">
        <div className="offer-name">{video.offer.name}</div>
        {video.desc && <div className="video-description">{video.desc}</div>}
        <div className="video-title">{video.title}</div>
        {video.tags && video.tags.length > 0 && (
          <div className="video-tags">
            {video.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <a
          href={video.offer.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => onUserAction({ videoId: video.id, action: 'click', timestamp: Date.now() }, video)}
          className="cta-link"
        >
          本編を見る
        </a>
      </div>
    </section>
  );
}