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
  const attrs = legacyVideo?.attributes ?? {};
  const tags: string[] = Array.isArray(attrs.tags) ? attrs.tags : [];
  const genres: string[] = Array.isArray(attrs.genre) ? attrs.genre : [];
  const primaryCategory = genres.length > 0 ? genres[0] : (tags[0] || 'その他');
  const descFromTags = tags.length > 0 ? `${tags.slice(0, 2).join('、')}の動画です` : undefined;

  return {
    id: legacyVideo.id,
    type: legacyVideo.type,
    title: legacyVideo.title,
    desc: legacyVideo.desc || descFromTags,
    embedSrc: legacyVideo.embedSrc || '',
    offer: legacyVideo.offer,
    description: legacyVideo.desc || descFromTags,
    category: primaryCategory,
    tags,
    duration: typeof attrs.duration === 'number' ? `${Math.floor(attrs.duration / 60)}分` : undefined,
    isOfficial: Boolean(legacyVideo.desc && (legacyVideo.desc.includes('公式') || legacyVideo.desc.includes('サンプル'))),
    attributes: legacyVideo.attributes,
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
        const adaptedVideos = (Array.isArray(data) ? data : []).map(adaptLegacyVideo);
        
        // 無限スクロールのために動画配列を複製（3周分）
        const extendedVideos = [...adaptedVideos, ...adaptedVideos, ...adaptedVideos];
        
        setVideos(extendedVideos);
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