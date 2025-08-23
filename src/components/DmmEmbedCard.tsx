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
  const [inView, setInView] = useState(false);
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);
  const [thumbnailError, setThumbnailError] = useState(false);

  // 監視対象は「枠（iframe）」ではなく「セクション」側で見ると精度が上がる
  const sectionRef = useRef<HTMLElement | null>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const thumbnailUrl = getDmmThumbnailUrl(video.id);

  // CSS変数を使って背景画像を設定
  useEffect(() => {
    if (thumbnailRef.current && !thumbnailError) {
      thumbnailRef.current.style.setProperty('--bg-url', `url(${thumbnailUrl})`);
    }
  }, [thumbnailUrl, thumbnailError]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        setInView(e.isIntersecting);
        
        if (e.isIntersecting) {
          // 視聴開始
          setViewStartTime(Date.now());
        } else if (viewStartTime) {
          // 視聴終了 - ユーザー行動を記録
          const viewDuration = Date.now() - viewStartTime;
          const action = viewDuration > 5000 ? 'view' : 'skip';
          
          onUserAction({
            videoId: video.id,
            action,
            duration: viewDuration,
            timestamp: Date.now()
          }, video);
          
          setViewStartTime(null);
        }
      }),
      { threshold: 0.9 } // ほぼ全体が見えた時だけON
    );
    io.observe(el);
    return () => io.disconnect();
  }, [video.id, video, onUserAction, viewStartTime]);

  // 見えたらsrcを入れる、外れたらアンロード（再入場時は最初から）
  useEffect(() => {
    const iframe = frameRef.current;
    if (!iframe) return;
    if (inView) {
      if (!iframe.src || iframe.src === "about:blank") iframe.src = video.videoUrl;
    } else {
      // ロードを確実に止める
      if (iframe.src && iframe.src !== "about:blank") iframe.src = "about:blank";
    }
  }, [inView, video.videoUrl]);

  // CTAクリック時の行動記録
  const handleCtaClick = () => {
    onUserAction({
      videoId: video.id,
      action: 'click',
      timestamp: Date.now()
    }, video);
  };

  return (
    <section ref={sectionRef} className="card" aria-label={video.title}>
      <div className="video-thumbnail-container">
        {/* サムネイル表示（画面内に入るまではプレビューを表示） */}
        {!inView && (
          <div 
            ref={thumbnailRef}
            className={`video-thumbnail ${thumbnailError ? 'error' : ''}`}
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

        {/* 画面内に入ったらiframeを表示・読み込み */}
        <iframe
          ref={frameRef}
          title={video.title}
          className={`video-iframe ${!inView ? 'hidden' : ''}`}
          sandbox="allow-forms allow-scripts allow-presentation allow-same-origin"
          allow="autoplay; encrypted-media; picture-in-picture"
          scrolling="no"
          frameBorder={0}
          allowFullScreen
          height="100%"
          src="about:blank" // 初期状態は空
        ></iframe>
      </div>
      <div className="video-info">
        <div className="offer-name">{video.offer.name}</div>
        {video.description && <div className="video-description">{video.description}</div>}
        <div className="video-title">{video.title}</div>
        <a
          href={`/go/${video.id}`}
          onClick={handleCtaClick}
          rel="sponsored"
          className="cta-link"
        >
          本編へ
        </a>
      </div>
    </section>
  );
}