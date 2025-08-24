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
      
      // DUGAプレイヤー初期化のための遅延処理
      const initializePlayer = () => {
        console.log(`Attempting to initialize player for ${video.id}`);
        
        // DUGAスクリプトの直接実行を試行
        const scriptContent = `
          (function() {
            var playerId = 'dugaflvplayer-${video.id}';
            var playerDiv = document.getElementById(playerId);
            if (playerDiv) {
              console.log('Found player div:', playerId);
              // DUGAプレイヤーを直接埋め込み
              var iframe = document.createElement('iframe');
              iframe.src = 'https://ad.duga.jp/movie/${video.id}/48475-01/540/300';
              iframe.width = '100%';
              iframe.height = '100%';
              iframe.style.border = 'none';
              iframe.style.minHeight = '300px';
              iframe.allowFullscreen = true;
              iframe.allow = 'autoplay; encrypted-media';
              playerDiv.innerHTML = '';
              playerDiv.appendChild(iframe);
              console.log('DUGA iframe created for ${video.id}');
            } else {
              console.error('Player div not found:', playerId);
            }
          })();
        `;
        
        const script = document.createElement('script');
        script.textContent = scriptContent;
        document.head.appendChild(script);
        
        // スクリプトを即座に削除してメモリリーク防止
        setTimeout(() => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        }, 100);
      };
      
      // 短い遅延後に初期化実行
      setTimeout(initializePlayer, 100);
      
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