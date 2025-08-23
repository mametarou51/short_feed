"use client";
import { useEffect, useState } from "react";
import DmmEmbedCard from "@/components/DmmEmbedCard";

type Dmm = {
  id: string;
  type: "dmm_iframe";
  title: string;
  embedSrc: string;
  offer: { name: string; url: string };
};

export default function Home() {
  const [list, setList] = useState<Dmm[]>([]);
  const [ageOk, setAgeOk] = useState<boolean>(false);

  useEffect(() => {
    setAgeOk(!!localStorage.getItem("agreed18"));
    fetch("/videos.json").then((r) => r.json()).then(setList);
  }, []);

  return (
    <main
      className="h-[100svh] overflow-y-scroll bg-black w-full"
      style={{ 
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
        WebkitOverflowScrolling: "touch"
      }}
    >
      {!ageOk && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.85)",
            color: "#fff", display: "grid", placeItems: "center", zIndex: 50, textAlign: "center", padding: 24
          }}
        >
          <div style={{ maxWidth: 480 }}>
            <h2 style={{ fontSize: 22, marginBottom: 12 }}>18歳以上ですか？</h2>
            <p style={{ opacity: .9, marginBottom: 16 }}>
              成人向けの内容を含みます。18歳以上の場合のみ続行してください。
            </p>
            <button
              onClick={() => { localStorage.setItem("agreed18", "1"); setAgeOk(true); }}
              style={{ padding: "10px 16px", background: "#fff", color: "#000", borderRadius: 8, fontWeight: 600 }}
            >
              はい、続行する
            </button>
          </div>
        </div>
      )}

      {ageOk && list.map((v) =>
        v.type === "dmm_iframe" ? (
          <DmmEmbedCard
            key={v.id}
            id={v.id}
            title={v.title}
            embedSrc={v.embedSrc}
            offerName={v.offer.name}
          />
        ) : null
      )}
    </main>
  );
}