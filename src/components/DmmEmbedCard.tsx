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

  // DUGAサムネイル読み込み
  useEffect(() => {
    if (video.type === 'duga_iframe' && dugaThumbnailRef.current) {
      const container = dugaThumbnailRef.current;
      
      // サムネイル用のHTML構造を作成
      container.innerHTML = `
        <div id="affimage-${video.id}">
          <a href="${video.offer.url}" target="_blank">${video.title}</a>
        </div>
      `;
      
      // サムネイル用スクリプトを読み込み
      const thumbnailScript = document.createElement('script');
      thumbnailScript.type = 'text/javascript';
      thumbnailScript.src = `https://ad.duga.jp/affimage/ppv/${video.id}/1/48475-01`;
      thumbnailScript.async = true;
      container.appendChild(thumbnailScript);
      
      return () => {
        // クリーンアップ
        container.innerHTML = '';
      };
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
              ref={dugaThumbnailRef}
              className="duga-thumbnail"
              onClick={handleThumbnailClick}
            />
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
        <a
          href={`/go/${video.id}`}
          onClick={() => onUserAction({ videoId: video.id, action: 'click', timestamp: Date.now() }, video)}
          rel="sponsored"
          className="cta-link"
        >
          本編へ
        </a>
      </div>
    </section>
  );
}