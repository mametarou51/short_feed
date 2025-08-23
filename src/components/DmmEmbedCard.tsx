"use client";
import { useEffect, useRef, useState } from "react";

type Video = {
  id: string;
  type: string;
  title: string;
  desc?: string;
  embedSrc: string;
  attributes: {
    studio: string;
    genre: string[];
    tags: string[];
    duration: number;
    releaseDate: string;
    difficulty: string;
    popularity: number;
    timeOfDay: string[];
    mood: string[];
  };
  offer: {
    name: string;
    url: string;
  };
};

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
  id: string;
  title: string;
  embedSrc: string;
  offerName: string;
  video: Video;
  onUserAction: (behavior: UserBehavior, video: Video) => void;
};

export default function DmmEmbedCard({ id, title, embedSrc, offerName, video, onUserAction }: Props) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [inView, setInView] = useState(false);
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // 監視対象は「枠（iframe）」ではなく「セクション」側で見ると精度が上がる
  const sectionRef = useRef<HTMLElement | null>(null);

  const thumbnailUrl = getDmmThumbnailUrl(id);

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
          const action = viewDuration > video.attributes.duration * 1000 * 0.8 ? 'complete' : 
                       viewDuration > 5000 ? 'view' : 'skip';
          
          onUserAction({
            videoId: id,
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
  }, [id, video, onUserAction, viewStartTime]);

  // 見えたらiframeの準備はするが、手動再生まではsrcを入れない
  useEffect(() => {
    const iframe = frameRef.current;
    if (!iframe) return;
    
    // 自動再生はしない - ユーザーのクリックを待つ
    if (isPlaying && inView) {
      if (!iframe.src || iframe.src === "about:blank") iframe.src = embedSrc;
    } else {
      // 再生停止時はロードを確実に止める
      if (iframe.src && iframe.src !== "about:blank") iframe.src = "about:blank";
    }
  }, [isPlaying, inView, embedSrc]);

  // 再生ボタンクリック時の処理
  const handlePlayClick = () => {
    setIsPlaying(true);
    setViewStartTime(Date.now());
    
    // 再生開始の行動記録
    onUserAction({
      videoId: id,
      action: 'view',
      timestamp: Date.now()
    }, video);
  };

  // CTAクリック時の行動記録
  const handleCtaClick = () => {
    onUserAction({
      videoId: id,
      action: 'click',
      timestamp: Date.now()
    }, video);
  };

  return (
    <section ref={sectionRef} className="card" aria-label={title}>
      <div className="video-thumbnail-container">
        {/* サムネイル表示 */}
        {!isPlaying && (
          <div 
            className={`video-thumbnail ${thumbnailError ? 'error' : ''}`}
            style={{ 
              backgroundImage: !thumbnailError ? `url(${thumbnailUrl})` : 'none'
            }} 
            onClick={handlePlayClick}
          >
            {/* サムネイル画像のエラーハンドリング */}
            {!thumbnailError && (
              <img 
                src={thumbnailUrl} 
                alt={`${title}のサムネイル`}
                className="video-thumbnail-image"
                onError={() => setThumbnailError(true)}
                onLoad={() => setThumbnailError(false)}
              />
            )}
            
            {/* 再生ボタンオーバーレイ */}
            <div className="play-button-overlay">
              <div className="play-button-icon" />
            </div>
            
            {/* フォールバック表示（サムネイル取得失敗時） */}
            {thumbnailError && (
              <div className="thumbnail-fallback">
                <div className="thumbnail-fallback-icon">🎬</div>
                <div className="thumbnail-fallback-text">クリックして再生</div>
              </div>
            )}
          </div>
        )}

        {/* iframe (再生中のみ表示) */}
        <iframe
          ref={frameRef}
          title={title}
          className={`video-iframe ${!isPlaying ? 'hidden' : ''}`}
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          allow="autoplay; encrypted-media; picture-in-picture"
          scrolling="no"
          frameBorder={0}
          allowFullScreen
        />
      </div>

      <div className="card-footer">
        <div className="offer-name">{offerName}</div>
        {video.desc && <div className="video-description">{video.desc}</div>}
        <div className="video-title">{video.title}</div>
        <a
          href={`/go/${id}`}
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