"use client";
import { useEffect, useState } from "react";
import DmmEmbedCard from "@/components/DmmEmbedCard";
import useRecommendationAlgorithm from "@/hooks/useRecommendationAlgorithm";

type Row = {
  id: string;
  type: string;
  title: string;
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
  offer: { name: string; url: string };
};

function AgeGate({ onAllow }: { onAllow: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", color: "#fff",
      display: "grid", placeItems: "center", zIndex: 50, textAlign: "center", padding: 24
    }}>
      <div style={{ maxWidth: 480 }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>18歳以上ですか？</h2>
        <p style={{ opacity: .9, marginBottom: 16 }}>成人向けの内容を含みます。18歳以上の場合のみ続行してください。</p>
        <button
          onClick={() => { localStorage.setItem("agreed18", "1"); onAllow(); }}
          style={{ padding: "10px 16px", background: "#fff", color: "#000", borderRadius: 8, fontWeight: 600 }}
        >
          はい、続行する
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [rows, setRows] = useState<Row[]>([]);
  const [sortedRows, setSortedRows] = useState<Row[]>([]);
  const [ok, setOk] = useState<boolean>(false);
  const { sortVideosByRecommendation, trackUserBehavior } = useRecommendationAlgorithm();

  useEffect(() => { 
    setOk(!!localStorage.getItem("agreed18"));
    fetch("/videos.json").then(r => r.json()).then(data => {
      setRows(data);
      // アルゴリズムでソート
      const sorted = sortVideosByRecommendation(data);
      setSortedRows(sorted);
    }); 
  }, [sortVideosByRecommendation]);

  return (
    <main className="feed no-scrollbar">
      {!ok && <AgeGate onAllow={() => setOk(true)} />}
      {ok && sortedRows.map(r =>
        <DmmEmbedCard
          key={r.id}
          id={r.id}
          title={r.title}
          embedSrc={r.embedSrc}
          offerName={r.offer.name}
          video={r}
          onUserAction={trackUserBehavior}
        />
      )}
    </main>
  );
}