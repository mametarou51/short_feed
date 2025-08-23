'use client';

import { useRef, useEffect, useState } from 'react';
import VideoPlayer from './VideoPlayer';
import { Video } from '@/types/video';

interface VideoContainerProps {
  video: Video;
  onVisibilityChange?: (videoId: string, isVisible: boolean) => void;
}

export default function VideoContainer({ video, onVisibilityChange }: VideoContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const visible = entry.intersectionRatio >= 0.7;
        
        if (visible !== isVisible) {
          setIsVisible(visible);
          onVisibilityChange?.(video.id, visible);
        }
      },
      {
        threshold: 0.7, // 70% visible as specified in requirements
        rootMargin: '0px',
      }
    );

    const container = containerRef.current;
    if (container) {
      observer.observe(container);
    }

    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  }, [video.id, isVisible, onVisibilityChange]);

  return (
    <div ref={containerRef}>
      <VideoPlayer video={video} isVisible={isVisible} />
    </div>
  );
}