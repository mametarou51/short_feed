"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  id: string;
  title: string;
  embedSrc: string;
  offerName: string;
};

export default function DmmEmbedCard({ id, title, embedSrc, offerName }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [inView, setInView] = useState(false);

  // 可視・不可視を監視
  useEffect(() => {
    const el = iframeRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setInView(e.isIntersecting)),
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 見えたら src を付与、外れたらアンロード
  useEffect(() => {
    const el = iframeRef.current;
    if (!el) return;
    if (inView) {
      // 既に同一URLなら再代入しない（チラつき防止）
      if (!el.src || el.src === "about:blank") el.src = embedSrc;
    } else {
      el.src = "about:blank";
    }
  }, [inView, embedSrc]);

  return (
    <section
      className="relative h-[100svh] w-full snap-start bg-black overflow-hidden"
      aria-label={title}
    >
      {/* 全画面iframe（YouTubeショート風） */}
      <iframe
        ref={iframeRef}
        title={title}
        // src は IO で付与/削除する
        scrolling="no"
        frameBorder={0}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          width: '100%', 
          height: '100%',
          border: 'none',
          objectFit: 'cover'
        }}
      />

      {/* 右下のCTAエリア（YouTubeショート風） */}
      <div className="absolute bottom-0 right-0 p-4 z-20">
        <div className="flex flex-col items-end space-y-3">
          <a
            href={`/go/${id}`}
            className="bg-white bg-opacity-90 backdrop-blur-sm text-black px-6 py-3 rounded-full font-bold text-sm shadow-lg hover:bg-opacity-100 transition-all"
          >
            本編へ →
          </a>
        </div>
      </div>

      {/* 左下のタイトルエリア（YouTubeショート風） */}
      <div className="absolute bottom-0 left-0 right-20 p-4 z-10">
        <div
          className="text-white"
          style={{ 
            background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.7))",
            borderRadius: "12px 12px 0 0",
            padding: "20px 16px 16px"
          }}
        >
          <div className="text-xs opacity-80 mb-1">{offerName}</div>
          <div className="text-base font-medium leading-tight line-clamp-2">
            {title}
          </div>
        </div>
      </div>
    </section>
  );
}