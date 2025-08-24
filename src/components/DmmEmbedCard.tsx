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

export default function DmmEmbedCard({ video, onUserAction }: Props) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  // DUGAビデオプレイヤーコンポーネント
  function DugaVideoPlayer({ video }: { video: Video }) {
    const playerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (playerRef.current) {
        const container = playerRef.current;
        // プレイヤー用HTML構造
        container.innerHTML = `
          <div id="dugaflvplayer-${video.id}"
               data-w="540"
               data-h="300"
               data-o="dugaflvplayer-${video.id}"
               data-l="ppv"
               data-p="${video.id}"
               data-a="48475"
               data-b="01">
            <a href="${video.offer.url}" target="_blank">${video.title}</a>
          </div>
        `;
        // プレイヤー用スクリプト
        const playerScript = document.createElement('script');
        playerScript.type = 'text/javascript';
        playerScript.src = 'https://ad.duga.jp/flash/dugaflvplayer.js';
        playerScript.defer = true;
        document.head.appendChild(playerScript);
        
        onUserAction({
          videoId: video.id,
          action: 'view',
          timestamp: Date.now()
        }, video);
        
        return () => {
          container.innerHTML = '';
          const existingScript = document.head.querySelector(`script[src='https://ad.duga.jp/flash/dugaflvplayer.js']`);
          if (existingScript) {
            document.head.removeChild(existingScript);
          }
        };
      }
    }, [video.id, video.offer.url, video.title]);

    return (
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
    );
  }

  // 自動的に動画を表示し、ユーザー行動を記録
  useEffect(() => {
    onUserAction({
      videoId: video.id,
      action: 'view',
      timestamp: Date.now()
    }, video);
  }, [video.id, onUserAction]);

  return (
    <section className="card" aria-label={video.title}>
      <div className="video-container">
        {/* 動画を直接表示 */}
        {video.type === 'duga_iframe' ? (
          <DugaVideoPlayer video={video} />
        ) : (
          <iframe
            ref={frameRef}
            src={video.embedSrc}
            title={video.title}
            className="video-iframe custom-iframe"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        )}
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