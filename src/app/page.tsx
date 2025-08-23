"use client";
import { useEffect, useState } from "react";
import DmmEmbedCard from "@/components/DmmEmbedCard";
import { useVideos } from "@/hooks/useVideos";
import useRecommendationAlgorithm from "@/hooks/useRecommendationAlgorithm";

type UserBehavior = {
  videoId: string;
  action: 'view' | 'skip' | 'complete' | 'click';
  duration?: number;
  timestamp: number;
};

function AgeGate({ onAllow }: { onAllow: () => void }) {
  return (
    <div className="age-gate-overlay">
      <div className="age-gate-modal">
        <div className="age-gate-content">
          <h2>年齢確認</h2>
          <div className="age-gate-text">
            <p>成人向けの内容を含むため、18歳以上の方のみご利用いただけます。</p>
          </div>
          <div className="age-gate-buttons">
            <button
              className="age-gate-button agree"
              onClick={() => {
                localStorage.setItem("agreed18", "1");
                onAllow();
              }}
            >
              18歳以上です
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [ok, setOk] = useState(false);
  const { videos, loading, error } = useVideos();
  const { sortVideosByRecommendation, trackUserBehavior } = useRecommendationAlgorithm();

  useEffect(() => { 
    setOk(!!localStorage.getItem("agreed18"));
  }, []);

  const sortedVideos = sortVideosByRecommendation(videos);

  if (loading) {
    return (
      <main className="feed no-scrollbar">
        <div className="loading">動画を読み込み中...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="feed no-scrollbar">
        <div className="error">エラーが発生しました: {error}</div>
      </main>
    );
  }

  return (
    <main className="feed no-scrollbar">
      {!ok && <AgeGate onAllow={() => setOk(true)} />}
      {ok && sortedVideos.map(video =>
        <DmmEmbedCard
          key={video.id}
          video={video}
          onUserAction={trackUserBehavior}
        />
      )}
    </main>
  );
}
