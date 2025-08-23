'use client';

import { useState } from 'react';
import { useVideos } from '@/hooks/useVideos';
import VideoContainer from '@/components/VideoContainer';
import AgeGate from '@/components/AgeGate';
import Footer from '@/components/Footer';

export default function Home() {
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const { videos, loading, error } = useVideos();

  if (loading) {
    return (
      <div className="loading">
        <div>読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <div>
          <h2>エラーが発生しました</h2>
          <p>{error}</p>
          <p>ページを再読み込みしてください。</p>
        </div>
      </div>
    );
  }

  const handleVisibilityChange = (videoId: string, isVisible: boolean) => {
    if (isVisible) {
      console.log(`Video ${videoId} is now visible`);
    } else {
      console.log(`Video ${videoId} is now hidden`);
    }
  };

  return (
    <>
      {!isAgeVerified && (
        <AgeGate onAgeVerified={() => setIsAgeVerified(true)} />
      )}
      
      <main className="snap-container">
        {isAgeVerified && videos.map((video) => (
          <VideoContainer
            key={video.id}
            video={video}
            onVisibilityChange={handleVisibilityChange}
          />
        ))}
        {isAgeVerified && <Footer />}
      </main>
    </>
  );
}