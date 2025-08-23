"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  id: string;
  title: string;
  embedSrc: string;
  offerName: string;
};

export default function DmmEmbedCard({ id, title, embedSrc, offerName }: Props) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [inView, setInView] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 9000) + 1000);

  // 監視対象は「枠（iframe）」ではなく「セクション」側で見ると精度が上がる
  const sectionRef = useRef<HTMLElement | null>(null);

  // コンポーネント初期化時にローカルストレージから「いいね」状態を復元
  useEffect(() => {
    const liked = localStorage.getItem(`liked_${id}`) === 'true';
    setIsLiked(liked);
  }, [id]);

  // いいねボタンのハンドラ
  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    localStorage.setItem(`liked_${id}`, newLikedState.toString());
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setInView(e.isIntersecting)),
      { threshold: 0.9 } // ほぼ全体が見えた時だけON
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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

      {/* 右側のアクションボタン */}
      <div style={{
        position: "absolute",
        right: 16,
        bottom: 100,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        zIndex: 10
      }}>
        <div 
          onClick={handleLike}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: isLiked ? "rgba(255,23,68,0.8)" : "rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: isLiked ? "scale(1.1)" : "scale(1)"
          }}
        >
          <span style={{ 
            fontSize: 24,
            transform: isLiked ? "scale(1.2)" : "scale(1)",
            transition: "transform 0.2s ease"
          }}>
            {isLiked ? "💖" : "🤍"}
          </span>
          <span style={{ 
            fontSize: 10, 
            color: "#fff", 
            fontWeight: "bold",
            marginTop: 2
          }}>
            {likeCount > 9999 ? `${Math.floor(likeCount/1000)}k` : likeCount}
          </span>
        </div>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer"
        }}>
          <span style={{ fontSize: 24 }}>💬</span>
        </div>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer"
        }}>
          <span style={{ fontSize: 24 }}>📤</span>
        </div>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer"
        }}>
          <span style={{ fontSize: 24 }}>🔖</span>
        </div>
      </div>

      {/* 左下のタイトルエリア */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 80,
        padding: "20px 16px",
        background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.8))",
        color: "#fff",
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#ff1744",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: "bold"
          }}>
            {offerName.charAt(0)}
          </div>
          <span style={{ fontSize: 14, fontWeight: "bold" }}>@{offerName.toLowerCase()}</span>
          <button style={{
            padding: "4px 12px",
            background: "transparent",
            border: "1px solid #fff",
            borderRadius: 4,
            color: "#fff",
            fontSize: 12,
            cursor: "pointer"
          }}>
            フォロー
          </button>
        </div>
        <div style={{ fontSize: 15, marginBottom: 12, lineHeight: "1.4" }}>
          {title} #大人の動画 #おすすめ #viral
        </div>
        <a
          href={`/go/${id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            background: "#ff1744",
            color: "#fff",
            borderRadius: 25,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none"
          }}
        >
          <span>▶️</span>
          本編を見る
        </a>
      </div>
    </section>
  );
}