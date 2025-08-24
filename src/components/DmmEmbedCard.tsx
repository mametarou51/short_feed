"use client";
import { useRef, useState, useEffect } from "react";
import { Video } from '@/types/video';

// サムネイル画像URLを生成する関数
function getThumbnailUrl(video: Video): string {
  if (video.type === 'duga_iframe') {
    // DUGAの場合はフォールバック画像を使用
    return `/sample_img/240x180.jpg`;
  } else {
    // DMMの場合
    return `https://pics.dmm.co.jp/digital/video/${video.id}/${video.id}pl.jpg`;
  }
}

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
  const [showVideo, setShowVideo] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const dugaThumbnailRef = useRef<HTMLDivElement>(null);

  // DUGAサムネイル読み込み（無効化）
  useEffect(() => {
    // DUGAサムネイルは表示しない
    if (video.type === 'duga_iframe' && dugaThumbnailRef.current) {
      // サムネイルなしで直接プレイボタンを表示
    }
  }, [video.type, video.id, video.offer.url, video.title]);

  // サムネイルクリックで動画表示
  const handleThumbnailClick = () => {
    setShowVideo(true);
    onUserAction({
      videoId: video.id,
      action: 'click',
      timestamp: Date.now()
    }, video);
  };

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

  return (
    <section className="card" aria-label={video.title}>
      <div className="video-thumbnail-container">
        {/* サムネイルを動画に重ねて表示 */}
        {!showVideo && (
          video.type === 'duga_iframe' ? (
            <div 
              className="duga-thumbnail-placeholder"
              onClick={handleThumbnailClick}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <div className="play-button-overlay">
                <div className="play-button-icon"></div>
              </div>
            </div>
          ) : (
            <div 
              className={`video-thumbnail custom-thumbnail-bg`}
              data-bg-url={getThumbnailUrl(video)}
              onClick={handleThumbnailClick}
            >
              <div className="play-button-overlay">
                <div className="play-button-icon"></div>
              </div>
            </div>
          )
        )}
        {/* サムネイルクリック後に動画表示 */}
        {showVideo && (
          video.type === 'duga_iframe' ? (
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
          )
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