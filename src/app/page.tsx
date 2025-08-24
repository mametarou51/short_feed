"use client";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import DugaEmbedCard from "@/components/DugaEmbedCard";
import { useVideos } from "@/hooks/useVideos";
import useRecommendationAlgorithm from "@/hooks/useRecommendationAlgorithm";
import type { Video } from "@/types/video";

// JuicyAdsの型定義
declare global {
  interface Window {
    adsbyjuicy?: any[];
  }
}

// 期間を ISO 8601 に変換（例: 180 -> PT3M）
function toIsoDuration(seconds?: number): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m && s) return `PT${m}M${s}S`;
  if (m) return `PT${m}M`;
  return `PT${s}S`;
}

// サムネイル推測（DMMは既知パターン、その他はフォールバック）
function guessThumbnailUrl(videoId: string): string {
  return `https://pics.dmm.co.jp/digital/video/${videoId}/${videoId}pl.jpg`;
}

type UserBehavior = {
  videoId: string;
  action: 'view' | 'skip' | 'complete' | 'click';
  duration?: number;
  timestamp: number;
};

type ContentItem = {
  type: 'video' | 'ad';
  id: string;
  content: Video | null;
  adId?: string;
  originalIndex: number;
  cycle: number; // 何周目かを示す
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
  const [currentCycle, setCurrentCycle] = useState(0);
  const [displayedContent, setDisplayedContent] = useState<ContentItem[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { 
    setOk(!!localStorage.getItem("agreed18"));
  }, []);

  // JuicyAdsの初期化
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === 'undefined') return;
    
    // window.adsbyjuicyを初期化（スクリプト読み込み前でも安全）
    window.adsbyjuicy = window.adsbyjuicy || [];
    
    // JuicyAdsスクリプトが既に読み込まれているかチェック
    if (!document.querySelector('script[src*="jads.js"]')) {
      // スクリプトが読み込まれていない場合は読み込む
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://poweredby.jads.co/js/jads.js';
      script.async = true;
      script.onload = () => {
        console.log('JuicyAds script loaded successfully');
      };
      script.onerror = () => {
        console.log('Failed to load JuicyAds script');
      };
      document.head.appendChild(script);
    }
  }, []);

  // 完全ランダムシャッフル
  const shuffledVideos = useMemo(() => {
    if (!videos || videos.length === 0) return [];
    const shuffled = [...videos];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [videos]);

  // 動画と広告を混ぜ込んでランダム表示
  const createContentItems = useCallback((videos: Video[], cycle: number): ContentItem[] => {
    if (!videos || videos.length === 0) return [];
    
    // 動画リストを作成（duga_iframeタイプのみ）
    const filteredVideos = videos.filter(video => video.type === 'duga_iframe');
    if (filteredVideos.length === 0) return [];
    
    // デバッグログ
    console.log(`Creating content for cycle ${cycle}:`, {
      totalVideos: videos.length,
      filteredVideos: filteredVideos.length,
      cycle
    });
    
    // 各サイクルで異なるシャッフルを適用（シード付きランダム）
    const shuffledVideos = [...filteredVideos];
    const seed = cycle * 1000 + Date.now(); // サイクルごとに異なるシード
    for (let i = shuffledVideos.length - 1; i > 0; i--) {
      const j = Math.floor((seed + i) % (i + 1));
      [shuffledVideos[i], shuffledVideos[j]] = [shuffledVideos[j], shuffledVideos[i]];
    }
    
    const content: ContentItem[] = shuffledVideos.map((video, index) => ({
      type: 'video' as const,
      id: `${video.id}-cycle-${cycle}`,
      content: video,
      originalIndex: index,
      cycle
    }));
    
    // 広告を動画の数に応じて複数挿入（例：動画10個につき1個の広告）
    const adInterval = Math.max(5, Math.floor(content.length / 10));
    let adCount = 0;
    for (let i = adInterval; i < content.length; i += adInterval) {
      content.splice(i, 0, {
        type: 'ad',
        id: `ad-${i}-cycle-${cycle}`,
        adId: adCount % 4 === 0 ? '01' : adCount % 4 === 1 ? '02' : adCount % 4 === 2 ? '03' : 'juicy', // 広告IDを4つ循環で設定（DUGA 3つ + JuicyAds 1つ）
        content: null,
        originalIndex: i,
        cycle
      });
      adCount++;
    }
    
    // 全体をシャッフル
    for (let i = content.length - 1; i > 0; i--) {
      const j = Math.floor((seed + i * 2) % (i + 1));
      [content[i], content[j]] = [content[j], content[i]];
    }
    
    console.log(`Cycle ${cycle} content created:`, {
      totalItems: content.length,
      videoItems: content.filter(item => item.type === 'video').length,
      adItems: content.filter(item => item.type === 'ad').length
    });
    
    return content;
  }, []);

  // 初期コンテンツを設定
  useEffect(() => {
    if (shuffledVideos.length > 0) {
      const initialContent = createContentItems(shuffledVideos, 0);
      setDisplayedContent(initialContent);
    }
  }, [shuffledVideos, createContentItems]);

  // 無限スクロール用のIntersection Observer
  useEffect(() => {
    if (!lastItemRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 最後のアイテムが見えたら、新しいサイクルのコンテンツを追加
            const newCycle = currentCycle + 1;
            const newContent = createContentItems(shuffledVideos, newCycle);
            
            setDisplayedContent(prev => [...prev, ...newContent]);
            setCurrentCycle(newCycle);
          }
        });
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(lastItemRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [currentCycle, shuffledVideos, createContentItems]);

  // SEO最適化された構造化データ（先頭30件を ItemList として出力）
  const jsonLd = useMemo(() => {
    if (!shuffledVideos || shuffledVideos.length === 0) return null;
    const site = 'https://short-feed.pages.dev';
    const elements = shuffledVideos.slice(0, 30).map((video, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'VideoObject',
        name: video.title,
        description: `${video.desc || video.title} - 無料エロ動画 | ${video.attributes?.studio || 'Short Feed'}の人気作品。${video.attributes?.genre?.join('・') || ''}${video.attributes?.tags?.join('・') || ''}などのジャンルで話題の動画を高画質で配信中。`,
        thumbnailUrl: guessThumbnailUrl(video.id),
        uploadDate: video.attributes?.releaseDate || new Date().toISOString().split('T')[0],
        duration: toIsoDuration(video.attributes?.duration as unknown as number | undefined),
        embedUrl: video.embedSrc,
        contentUrl: video.offer?.url || `${site}/video/${video.id}`,
        isFamilyFriendly: false,
        contentRating: 'R18',
        genre: video.attributes?.genre?.join(', ') || '無料エロ動画',
        keywords: `無料エロ動画,${video.attributes?.tags?.join(',') || ''},${video.attributes?.genre?.join(',') || ''},${video.attributes?.studio || 'AV'},アダルト動画,18禁`,
        inLanguage: 'ja',
        interactionStatistic: {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/WatchAction',
          userInteractionCount: Math.floor((video.attributes?.popularity || 7) * 1000)
        },
        publisher: { 
          '@type': 'Organization', 
          name: 'Short Feed - 無料エロ動画まとめサイト', 
          url: site,
          logo: {
            '@type': 'ImageObject',
            url: `${site}/sample_img/240x180.jpg`
          }
        },
        author: {
          '@type': 'Organization',
          name: video.attributes?.studio || 'Short Feed'
        },
        potentialAction: {
          '@type': 'WatchAction',
          target: video.offer?.url || video.embedSrc
        }
      }
    }));
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'ショートポルノ動画一覧 - 縦スクロール無料エロ動画・人気AV女優・素人・巨乳',
      description: 'YouTubeショート風の縦スクロールでショートポルノ動画を連続視聴できる無料エロ動画サイト。人気AV女優、素人、巨乳、フェラチオ、中出し、顔射など豊富なジャンルを縦型動画で毎日更新。スマホ最適化で快適視聴。',
      itemListElement: elements,
      numberOfItems: elements.length,
      mainEntity: {
        '@type': 'VideoGallery',
        name: 'ショートポルノ縦スクロール動画ギャラリー',
        description: 'YouTubeショート風縦スクロールで楽しめるショートポルノ動画コレクション'
      }
    };
  }, [shuffledVideos]);

  // JuicyAds広告の初期化 - 強化版
  useEffect(() => {
    const juicyAds = displayedContent.filter(item => item.type === 'ad' && item.adId === 'juicy');
    
    if (juicyAds.length > 0) {
      let initAttempts = 0;
      const maxAttempts = 10;
      
      const initializeJuicyAds = () => {
        if (typeof window !== 'undefined') {
          try {
            // window.adsbyjuicyが存在することを確認
            if (!window.adsbyjuicy || !Array.isArray(window.adsbyjuicy)) {
              console.log('JuicyAds array not ready, attempt:', initAttempts + 1);
              if (initAttempts < maxAttempts) {
                initAttempts++;
                setTimeout(initializeJuicyAds, 1000);
                return;
              }
            }
            
            const adElement = document.querySelector('[id="1099699"]');
            const fallbackElement = document.getElementById('juicy-fallback');
            
            if (adElement && !adElement.hasAttribute('data-juicy-initialized')) {
              console.log('Initializing JuicyAds with adzone 1099699');
              
              // JuicyAds初期化
              window.adsbyjuicy!.push({'adzone': 1099699});
              adElement.setAttribute('data-juicy-initialized', 'true');
              
              // 5秒後に広告が読み込まれているかチェック
              setTimeout(() => {
                const hasAdContent = adElement.querySelector('iframe, script, div[style*="width"], div[class]');
                const hasInnerHTML = adElement.innerHTML.trim().length > 50;
                
                if (hasAdContent || hasInnerHTML) {
                  console.log('JuicyAds loaded successfully');
                  if (fallbackElement) {
                    fallbackElement.style.display = 'none';
                  }
                } else {
                  console.log('JuicyAds failed to load, showing message');
                  if (fallbackElement) {
                    fallbackElement.innerHTML = '<div style="color: #666; font-size: 13px; text-align: center;">広告がブロックされています<br/><span style="font-size: 11px;">サイト運営のためご協力ください</span></div>';
                  }
                }
              }, 5000);
              
              // さらに長時間後のチェック
              setTimeout(() => {
                const hasAdContent = adElement.querySelector('iframe, script, div[style*="width"], div[class]');
                if (!hasAdContent && initAttempts < maxAttempts) {
                  console.log('Retrying JuicyAds initialization...');
                  adElement.removeAttribute('data-juicy-initialized');
                  adElement.innerHTML = '';
                  initAttempts++;
                  setTimeout(initializeJuicyAds, 2000);
                }
              }, 10000);
            }
          } catch (error) {
            console.error('JuicyAds initialization error:', error);
            if (initAttempts < maxAttempts) {
              initAttempts++;
              setTimeout(initializeJuicyAds, 2000);
            }
          }
        }
      };
      
      // 初期化開始
      const timer = setTimeout(initializeJuicyAds, 2000);
      return () => clearTimeout(timer);
    }
  }, [displayedContent]);

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
      {/* 構造化データ */}
      {jsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {!ok && <AgeGate onAllow={() => setOk(true)} />}
      {ok && displayedContent.map((item, index) => (
        <div key={item.id}>
          {item.type === 'video' && item.content ? (
            <DugaEmbedCard
              video={item.content}
              onUserAction={trackUserBehavior}
            />
          ) : item.type === 'ad' ? (
            item.adId === 'juicy' ? (
              <div className="card ad-container" style={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center', 
                backgroundColor: '#1a1a1a',
                minHeight: '300px',
                padding: '20px',
                position: 'relative',
                border: '1px solid #333'
              }}>
                {/* JuicyAds - より大きなサイズとフォールバック */}
                <div 
                  id="juicy-ad-container" 
                  style={{
                    width: '320px',
                    height: '250px',
                    backgroundColor: 'transparent',
                    position: 'relative'
                  }}
                >
                  <ins 
                    id="1099699" 
                    data-width="320" 
                    data-height="250"
                    style={{
                      display: 'block',
                      width: '320px',
                      height: '250px',
                      backgroundColor: 'transparent'
                    }}
                  ></ins>
                  {/* フォールバック表示 */}
                  <div 
                    id="juicy-fallback"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: '#888',
                      textAlign: 'center',
                      fontSize: '14px',
                      zIndex: 1,
                      pointerEvents: 'none'
                    }}
                  >
                    <div>広告を読み込み中...</div>
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>AdBlockを無効にしてください</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card ad-container" style={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center', 
                backgroundColor: '#000'
              }}>
                <iframe 
                  src={`https://ad.duga.jp/dynamic/48475/${item.adId}/`} 
                  marginWidth={0} 
                  marginHeight={0} 
                  width={420} 
                  height={180} 
                  frameBorder={0} 
                  style={{
                    border: 'none',
                    maxWidth: '90vw',
                    maxHeight: '50vh'
                  }} 
                  scrolling="no"
                  title="DUGA広告"
                >
                  <a href={`https://click.duga.jp/48475-${item.adId}`} target="_blank" rel="noopener noreferrer">DUGA</a>
                </iframe>
              </div>
            )
          ) : null}
        </div>
      ))}
      {/* 無限スクロール用の監視要素 */}
      <div 
        ref={lastItemRef}
        style={{ height: '20px', width: '100%' }}
      />
    </main>
  );
}
