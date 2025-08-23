'use client';

import { useEffect, useRef, useState } from 'react';
import { Video } from '@/types/video';

interface VideoPlayerProps {
  video: Video;
  isVisible: boolean;
}

export default function VideoPlayer({ video, isVisible }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hlsInstance, setHlsInstance] = useState<any>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    async function setupVideo() {
      if (!videoElement) return;
      if (!video.videoUrl) return;
      const isHLS = video.videoUrl.includes('.m3u8');
      
      if (isHLS && !videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Use hls.js for non-Safari browsers
        try {
          const Hls = (await import('hls.js')).default;
          
          if (Hls.isSupported()) {
            const hls = new Hls({
              startLevel: -1, // Auto quality
              capLevelToPlayerSize: true,
            });
            
            hls.loadSource(video.videoUrl);
            hls.attachMedia(videoElement);
            setHlsInstance(hls);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setIsLoaded(true);
            });
          }
        } catch (error) {
          console.error('Failed to load HLS:', error);
          setIsLoaded(true);
        }
      } else {
        // Native playback for Safari or non-HLS videos
        videoElement.src = video.videoUrl;
        setIsLoaded(true);
      }
    }

    setupVideo();

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        setHlsInstance(null);
      }
    };
  }, [video.videoUrl, hlsInstance]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !isLoaded) return;

    if (isVisible) {
      videoElement.play().catch(error => {
        console.log('Autoplay failed:', error);
      });
    } else {
      videoElement.pause();
    }
  }, [isVisible, isLoaded]);

  const handleCTAClick = () => {
    // Navigate to Cloudflare Workers endpoint for tracking
    // In production, this would be your Workers domain
    const workersUrl = process.env.NODE_ENV === 'production' 
      ? `https://your-workers-domain.workers.dev/go/${video.id}`
      : `/go/${video.id}`;
    
    window.open(workersUrl, '_blank');
  };

  return (
    <div className="video-section">
      <video
        ref={videoRef}
        className="video-player"
        poster={video.posterUrl}
        muted
        loop
        playsInline
        preload="metadata"
      />
      
      <div className="video-overlay">
        <div className="video-header">
          <div className="video-offer">
            提供: {video.offer.name}
          </div>
          {video.isOfficial && (
            <div className="official-badge">
              公式サンプル
            </div>
          )}
          {video.category && (
            <div className="category-badge">
              {video.category}
            </div>
          )}
        </div>
        
        <div className="video-content">
          <div className="video-title">
            {video.title}
          </div>
          
          {video.description && (
            <div className="video-description">
              {video.description}
            </div>
          )}
          
          {video.duration && (
            <div className="video-duration">
              再生時間: {video.duration}
            </div>
          )}
          
          {video.tags && video.tags.length > 0 && (
            <div className="video-tags">
              {video.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <button 
          className="cta-button"
          onClick={handleCTAClick}
        >
          本編へ
        </button>
      </div>
    </div>
  );
}