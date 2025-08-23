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
      className="relative h-[100svh] snap-start bg-black"
      aria-label={title}
    >
      {/* 16:9 埋め込みをセンタリング（レタボックス） */}
      <div className="absolute inset-0 grid place-items-center">
        <div style={{ width: "100%", maxWidth: 720, aspectRatio: "16/9" }}>
          <iframe
            ref={iframeRef}
            title={title}
            // src は IO で付与/削除する
            scrolling="no"
            frameBorder={0}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>

      {/* 画面下オーバーレイ（CTA） */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 p-4 text-white"
        style={{ background: "linear-gradient(180deg,transparent,rgba(0,0,0,.6))" }}
      >
        <div className="text-sm opacity-90">{offerName}</div>
        <div className="text-lg font-semibold mb-3 line-clamp-2">{title}</div>
        <a
          href={`/go/${id}`}
          className="inline-flex items-center justify-center rounded-md bg-white text-black px-4 py-2 font-medium"
        >
          本編へ
        </a>
      </div>
    </section>
  );
}