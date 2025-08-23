'use client';

import { useState, useEffect } from 'react';
import { Video } from '@/types/video';

interface UseVideosReturn {
  videos: Video[];
  loading: boolean;
  error: string | null;
}

// Legacy data adapter
function adaptLegacyVideo(legacyVideo: any): Video {
  return {
    id: legacyVideo.id,
    title: legacyVideo.title,
    posterUrl: `https://pics.dmm.co.jp/digital/video/${legacyVideo.id}/${legacyVideo.id}pl.jpg`,
    videoUrl: legacyVideo.embedSrc || '',
    offer: legacyVideo.offer,
    description: legacyVideo.desc || legacyVideo.attributes?.tags?.slice(0, 2).join('、') + 'の動画です',
    category: legacyVideo.attributes?.genre?.[0] || 'その他',
    tags: legacyVideo.attributes?.tags || [],
    duration: legacyVideo.attributes?.duration ? `${Math.floor(legacyVideo.attributes.duration / 60)}分` : undefined,
    isOfficial: legacyVideo.desc?.includes('公式') || legacyVideo.desc?.includes('サンプル'),
  };
}

export function useVideos(): UseVideosReturn {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/videos.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.status}`);
        }
        
        const data = await response.json();
        const adaptedVideos = data.map(adaptLegacyVideo);
        
        setVideos(adaptedVideos);
      } catch (err) {
        console.error('Video loading error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  return { videos, loading, error };
}