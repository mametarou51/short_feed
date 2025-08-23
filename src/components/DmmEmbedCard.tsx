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

  // 監視対象は「枠（iframe）」ではなく「セクション」側で見ると精度が上がる
  const sectionRef = useRef<HTMLElement | null>(null);

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

  // 見えたらsrcを入れる、外れたらアンロード（再入場時は最初から）
  useEffect(() => {
    const iframe = frameRef.current;
    if (!iframe) return;
    if (inView) {
      if (!iframe.src || iframe.src === "about:blank") iframe.src = embedSrc;
    } else {
      // ロードを確実に止める
      if (iframe.src && iframe.src !== "about:blank") iframe.src = "about:blank";
    }
  }, [inView, embedSrc]);

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
      {/* 16:9を画面中央に最大サイズで配置（上下黒帯） */}
      <iframe
        ref={frameRef}
        title={title}
        // srcはIOで制御
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none"
        }}
        sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        allow="autoplay; encrypted-media; picture-in-picture"
        scrolling="no"
        frameBorder={0}
        allowFullScreen
      />

      <div className="card-footer">
        <div style={{ fontSize: 12, opacity: .9 }}>{offerName}</div>
        {video.desc && <div style={{ fontSize: 14, opacity: .9, marginBottom: 8 }}>{video.desc}</div>}
        <div style={{ fontSize: 18, fontWeight: 700, margin: "8px 0" }}>{video.title}</div>
        <a
          href={`/go/${id}`}
          onClick={handleCtaClick}
          rel="sponsored"
          style={{
            display: "inline-flex", padding: "10px 16px",
            background: "#fff", color: "#000", borderRadius: 8, fontWeight: 600
          }}
        >
          本編へ
        </a>
      </div>
    </section>
  );
}