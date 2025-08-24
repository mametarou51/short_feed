"use client";
import { useRef, useState, useEffect } from "react";
import { Video } from '@/types/video';

type UserBehavior = {
  videoId: string;
  action: 'view' | 'skip' | 'complete' | 'click';
  duration?: number;
  timestamp: number;
};

type Props = {
  video: Video;
  onUserAction: (behavior: UserBehavior, video: Video) => void;
};

export default function DugaEmbedCard({ video, onUserAction }: Props) {
  const [showVideo, setShowVideo] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  // DUGAサムネイル読み込み
  useEffect(() => {
    if (thumbnailRef.current) {
      const container = thumbnailRef.current;
      
      // 一意なIDを生成（cycle情報を追加して重複を防ぐ）
      const uniqueId = `affimage-${video.id}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      const thumbnailId = uniqueId;
      
      // 既存の同じIDの要素をクリア
      const existingElement = document.getElementById(thumbnailId);
      if (existingElement) {
        existingElement.remove();
      }
      
      container.innerHTML = `<div id="${thumbnailId}"><a href="${video.offer.url}" target="_blank">${video.title}</a></div>`;
      
      // スクリプトが既に存在するかチェック
      const scriptId = `duga-script-${video.id}`;
      const existingScript = document.getElementById(scriptId);
      
      if (!existingScript) {
        // サムネイル用スクリプトを読み込み
        const script = document.createElement('script');
        script.id = scriptId;
        script.type = 'text/javascript';
        script.src = `https://ad.duga.jp/affimage/ppv/${video.id}/1/48475-01`;
        script.onload = () => {
          // 遅延実行で初期化関数を呼び出し
          setTimeout(() => {
            if (typeof (window as any).initAffImage === 'function') {
              try {
                (window as any).initAffImage();
              } catch (error) {
                console.log('initAffImage error:', error);
              }
            }
            
            // サムネイル内のリンクのクリックを防ぐ
            setTimeout(() => {
              const thumbnailLinks = container.querySelectorAll('a');
              thumbnailLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                });
              });
            }, 200);
          }, 300);
        };
        script.onerror = () => {
          console.log(`Failed to load DUGA script for ${video.id}`);
        };
        document.body.appendChild(script);
      } else {
        // スクリプトが既に存在する場合は直接初期化を試行
        setTimeout(() => {
          if (typeof (window as any).initAffImage === 'function') {
            try {
              (window as any).initAffImage();
            } catch (error) {
              console.log('initAffImage error (existing script):', error);
            }
          }
          
          setTimeout(() => {
            const thumbnailLinks = container.querySelectorAll('a');
            thumbnailLinks.forEach(link => {
              link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
              });
            });
          }, 200);
        }, 300);
      }
      
      return () => {
        // クリーンアップ時はcontainerのみクリア、スクリプトは残す
        container.innerHTML = '';
        const element = document.getElementById(thumbnailId);
        if (element) {
          element.remove();
        }
      };
    }
  }, [video.id, video.offer.url, video.title]);

  // DUGAプレイヤー読み込み
  useEffect(() => {
    if (showVideo && playerRef.current) {
      const container = playerRef.current;
      
      // プレイヤー用のHTML構造を作成
      const playerId = `dugaflvplayer-${video.id}`;
      container.innerHTML = `
        <div id="${playerId}" 
             data-w="540" 
             data-h="300" 
             data-o="${playerId}" 
             data-l="ppv" 
             data-p="${video.id}" 
             data-a="48475" 
             data-b="01"
             style="width: 540px; height: 300px;">
          <a href="${video.offer.url}" target="_blank">${video.title}</a>
        </div>
      `;
      
      console.log(`Created player div for ${video.id}:`, container.innerHTML);
      
      // プレイヤー用スクリプトを読み込み
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://ad.duga.jp/flash/dugaflvplayer.js';
      script.onload = () => {
        // スクリプト読み込み後、少し待ってからプレイヤーを初期化
        setTimeout(() => {
          // DUGAのプレイヤー初期化関数を実行
          if (typeof (window as any).initDugaAdMovie === 'function') {
            (window as any).initDugaAdMovie();
          }
        }, 200);
      };
      document.body.appendChild(script);
      
      return () => {
        // クリーンアップ
        container.innerHTML = '';
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [showVideo, video.id, video.offer.url, video.title]);

  const handleThumbnailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowVideo(true);
    onUserAction({
      videoId: video.id,
      action: 'click',
      timestamp: Date.now()
    }, video);
  };

  return (
    <section className="card" aria-label={video.title}>
      <div className="video-thumbnail-container" style={{position: 'relative'}}>
        {/* サムネイル表示 */}
        {!showVideo && (
          <div 
            ref={thumbnailRef}
            className="duga-thumbnail"
            onClick={handleThumbnailClick}
            style={{
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              zIndex: 2, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1a1a1a'
            }}
          >
            {/* プレイボタンオーバーレイ */}
            <div className="play-button-overlay">
              <div className="play-button-icon"></div>
            </div>
          </div>
        )}
        
        {/* プレイヤー表示 */}
        {showVideo && (
          <div 
            ref={playerRef}
            className="duga-video-container"
            style={{
              width: '100%', 
              height: '100%', 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              zIndex: 1,
              backgroundColor: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        )}
      </div>

      <div className="card-footer">
        <div className="offer-name">{video.offer.name}</div>
        {video.desc && <div className="video-description">{video.desc}</div>}
        <div className="video-title">{video.title}</div>
        {video.tags && video.tags.length > 0 && (
          <div className="video-tags">
            {video.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <a
          href={video.offer.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => onUserAction({ videoId: video.id, action: 'click', timestamp: Date.now() }, video)}
          className="cta-link"
        >
          本編を見る
        </a>
      </div>
    </section>
  );
}