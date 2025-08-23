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
    // Navigate to the /go/:id endpoint for tracking
    window.open(`/go/${video.id}`, '_blank');
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
        <div className="video-offer">
          提供: {video.offer.name}
        </div>
        <div className="video-title">
          {video.title}
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