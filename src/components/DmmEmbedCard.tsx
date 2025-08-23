"use client";
import { useRef, useState } from "react";
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

  // サムネイルクリックで動画表示
  const handleThumbnailClick = () => {
    setShowVideo(true);
    onUserAction({
      videoId: video.id,
      action: 'click',
      timestamp: Date.now()
    }, video);
  };

  return (
    <section className="card" aria-label={video.title}>
      <div className="video-thumbnail-container" style={{position: 'relative'}}>
        {/* サムネイルを動画に重ねて表示 */}
        {!showVideo && (
          <div 
            className={`video-thumbnail`}
            style={{
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              zIndex: 2, 
              cursor: 'pointer',
              backgroundImage: `url(${getThumbnailUrl(video)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            onClick={handleThumbnailClick}
          >
            <div className="play-button-overlay">
              <div className="play-button-icon"></div>
            </div>
          </div>
        )}
        {/* サムネイルクリック後に動画表示 */}
        {showVideo && (
          video.type === 'duga_iframe' ? (
            <div 
              className="duga-placeholder"
              style={{
                width: '100%', 
                height: '100%', 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                zIndex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#1a1a1a',
                color: 'white',
                flexDirection: 'column'
              }}
            >
              <div style={{textAlign: 'center', padding: '20px'}}>
                <div style={{fontSize: '16px', marginBottom: '15px'}}>DUGA動画</div>
                <a 
                  href={video.offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  DUGAで視聴する
                </a>
              </div>
            </div>
          ) : (
            <iframe
              ref={frameRef}
              src={video.embedSrc}
              title={video.title}
              className="video-iframe"
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              allow="autoplay; encrypted-media; picture-in-picture"
              style={{width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1, border: 'none'}}
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