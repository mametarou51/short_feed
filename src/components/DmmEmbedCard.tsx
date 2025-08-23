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

  // 監視対象は「枠（iframe）」ではなく「セクション」側で見ると精度が上がる
  const sectionRef = useRef<HTMLElement | null>(null);

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
      <div style={{
        position: "absolute", inset: 0, display: "grid", placeItems: "center"
      }}>
        <div style={{ width: "100%", maxWidth: 720, aspectRatio: "16/9" }}>
          <iframe
            ref={frameRef}
            title={title}
            // srcはIOで制御
            className="w-full h-full"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            allow="autoplay; encrypted-media; picture-in-picture"
            scrolling="no"
            frameBorder={0}
            allowFullScreen
          />
        </div>
      </div>

      <div className="card-footer">
        <div style={{ fontSize: 12, opacity: .9 }}>{offerName}</div>
        <div style={{ fontSize: 18, fontWeight: 700, margin: "8px 0" }}>{title}</div>
        <a
          href={`/go/${id}`}
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