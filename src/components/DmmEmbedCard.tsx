"use client";
import { useEffect, useRef, useState } from "react";
import { Video } from '@/types/video';
import Image from 'next/image';

// DMMのサムネイル画像URLを生成する関数
function getDmmThumbnailUrl(videoId: string): string {
  // DMMの一般的なサムネイル画像パターン
  return `https://pics.dmm.co.jp/digital/video/${videoId}/${videoId}pl.jpg`;
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
  const thumbnailUrl = video.posterUrl || getDmmThumbnailUrl(video.id);

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
            className={`video-thumbnail ${thumbnailError ? 'error' : ''}`}
            style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, cursor: 'pointer'}}
            onClick={handleThumbnailClick}
          >
            {!thumbnailError && (
              <Image
                src={thumbnailUrl}
                alt={`${video.title}のサムネイル`}
                fill
                sizes="100vw"
                className="video-thumbnail-image"
                onError={() => setThumbnailError(true)}
                onLoad={() => setThumbnailError(false)}
                unoptimized
                priority={false}
              />
            )}
            {thumbnailError && (
              <div className="thumbnail-fallback">
                <div className="thumbnail-fallback-icon">🎬</div>
                <div className="thumbnail-fallback-text">プレビュー</div>
              </div>
            )}
          </div>
        )}
        {/* サムネイルクリック後にiframe表示 */}
        {showVideo && (
          <iframe
            ref={frameRef}
            src={video.embedSrc}
            title={video.title}
            className="video-iframe"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            allow="autoplay; encrypted-media; picture-in-picture"
            scrolling="no"
            frameBorder={0}
            allowFullScreen
            style={{width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1}}
          />
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