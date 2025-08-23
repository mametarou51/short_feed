'use client';

import { useState, useEffect } from 'react';
import { Video, VideosArraySchema } from '@/types/video';

interface UseVideosReturn {
  videos: Video[];
  loading: boolean;
  error: string | null;
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
        const validatedVideos = VideosArraySchema.parse(data);
        
        setVideos(validatedVideos);
      } catch (err) {
        console.error('Video validation error:', err);
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