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
  adProvider?: 'duga' | 'juicy';
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
    console.log('🔍 JuicyAds initialization useEffect triggered');
    
    // クライアントサイドでのみ実行
    if (typeof window === 'undefined') {
      console.log('❌ Window is undefined, skipping JuicyAds initialization');
      return;
    }
    
    console.log('✅ Client-side detected, proceeding with JuicyAds initialization');
    
    // window.adsbyjuicyを初期化（スクリプト読み込み前でも安全）
    window.adsbyjuicy = window.adsbyjuicy || [];
    console.log('📝 window.adsbyjuicy initialized:', window.adsbyjuicy);
    
    // JuicyAdsスクリプトが既に読み込まれているかチェック
    const existingScript = document.querySelector('script[src*="jads.js"]');
    console.log('🔍 Checking for existing JuicyAds script:', existingScript);
    
    if (!existingScript) {
      console.log('📥 Loading JuicyAds script...');
      // スクリプトが読み込まれていない場合は読み込む
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://poweredby.jads.co/js/jads.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ JuicyAds script loaded successfully');
        console.log('📊 window.adsbyjuicy after script load:', window.adsbyjuicy);
      };
      script.onerror = (error) => {
        console.error('❌ Failed to load JuicyAds script:', error);
      };
      document.head.appendChild(script);
    } else {
      console.log('✅ JuicyAds script already exists');
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
    console.log(`📊 Creating ads for cycle ${cycle}:`, {
      contentLength: content.length,
      adInterval,
      estimatedAdCount: Math.floor(content.length / adInterval)
    });
    
    for (let i = adInterval; i < content.length; i += adInterval) {
      const isJuicyAd = adCount % 4 === 3; // 4回に1回JuicyAds (0,1,2がDUGA、3がJuicy)
      const adId = isJuicyAd ? 'juicy' : (adCount % 3 === 0 ? '01' : adCount % 3 === 1 ? '02' : '03');
      const adProvider = isJuicyAd ? 'juicy' : 'duga';
      
      console.log(`🎯 Creating ad ${adCount}:`, {
        position: i,
        adId,
        adProvider,
        isJuicyAd,
        cycle
      });
      
      content.splice(i, 0, {
        type: 'ad',
        id: `ad-${i}-cycle-${cycle}`,
        adId,
        adProvider,
        content: null,
        originalIndex: i,
        cycle
      });
      adCount++;
    }
    
    console.log(`📈 Ads creation completed for cycle ${cycle}:`, {
      totalAdsCreated: adCount,
      juicyAdsCount: Math.floor(adCount / 4),
      dugaAdsCount: adCount - Math.floor(adCount / 4)
    });
    
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

  // JuicyAds広告の初期化
  useEffect(() => {
    const hasJuicyAd = displayedContent.some(item => item.type === 'ad' && item.adProvider === 'juicy');
    console.log('🎯 JuicyAds ad initialization check:', {
      hasJuicyAd,
      totalContent: displayedContent.length,
      adItems: displayedContent.filter(item => item.type === 'ad').map(item => ({ 
        id: item.id, 
        adId: item.adId, 
        adProvider: item.adProvider 
      }))
    });
    
    if (hasJuicyAd) {
      console.log('🚀 JuicyAds ad found, starting initialization process...');
      
      // JuicyAds広告が表示されている場合、スクリプトが読み込まれるまで待つ
      const checkAndInit = () => {
        console.log('🔄 Checking JuicyAds readiness...', {
          windowExists: typeof window !== 'undefined',
          adsbyjuicyExists: !!(window as any)?.adsbyjuicy,
          isArray: Array.isArray((window as any)?.adsbyjuicy)
        });
        
        if (typeof window !== 'undefined' && window.adsbyjuicy && Array.isArray(window.adsbyjuicy)) {
          try {
            // JuicyAds要素を探す - 正しいIDで検索
            const existingAd = document.querySelector('[data-juicy-id*="juicy"]');
            console.log('🔍 Looking for JuicyAds element:', existingAd);
            
            if (existingAd && existingAd.getAttribute('data-juicy-initialized') !== 'true') {
              console.log('📢 Pushing to JuicyAds queue: adzone 1099712');
              window.adsbyjuicy.push({'adzone': 1099712});
              existingAd.setAttribute('data-juicy-initialized', 'true');
              console.log('✅ JuicyAds initialization completed');
              
              // JuicyAds広告が5秒後に表示されない場合はフォールバック表示
              setTimeout(() => {
                if (existingAd && existingAd.innerHTML.trim() === '') {
                  console.log('⚠️ JuicyAds not displaying, showing fallback');
                  existingAd.innerHTML = '<div style="background:#333;color:#fff;padding:20px;text-align:center;font-size:12px;">JuicyAds<br>ID: 1099712<br>(Advertisement loading...)</div>';
                }
              }, 5000);
            } else if (existingAd) {
              console.log('ℹ️ JuicyAds element already initialized:', existingAd.getAttribute('data-juicy-initialized'));
            } else {
              console.log('⚠️ JuicyAds element not found in DOM');
            }
          } catch (error) {
            console.error('❌ JuicyAds initialization error:', error);
          }
        } else {
          console.log('⏳ JuicyAds not ready yet, retrying in 500ms...');
          // まだ読み込まれていない場合は再試行
          setTimeout(checkAndInit, 500);
        }
      };
      
      // 初回チェックを少し遅らせる
      console.log('⏰ Scheduling JuicyAds initialization check in 1000ms...');
      const timer = setTimeout(checkAndInit, 1000);
      
      return () => {
        console.log('🧹 Cleaning up JuicyAds initialization timer');
        clearTimeout(timer);
      };
    } else {
      console.log('ℹ️ No JuicyAds found in current content');
    }
  }, [displayedContent]);

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

  // JuicyAds広告の初期化
  useEffect(() => {
    if (displayedContent.some(item => item.type === 'ad' && item.adId === 'juicy')) {
      // JuicyAds広告が表示されている場合、スクリプトが読み込まれるまで待つ
      const checkAndInit = () => {
        if (typeof window !== 'undefined' && window.adsbyjuicy && Array.isArray(window.adsbyjuicy)) {
          try {
            // 既に初期化されているかチェック（CSS IDセレクターを修正）
            const existingAd = document.querySelector('[id="1099699"]');
            if (existingAd && !existingAd.hasAttribute('data-juicy-initialized')) {
              window.adsbyjuicy.push({'adzone': 1099699});
              existingAd.setAttribute('data-juicy-initialized', 'true');
            }
          } catch (error) {
            console.log('JuicyAds initialization error:', error);
          }
        } else {
          // まだ読み込まれていない場合は再試行
          setTimeout(checkAndInit, 500);
        }
      };
      
      // 初回チェックを少し遅らせる
      const timer = setTimeout(checkAndInit, 1000);
      
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
            item.adProvider === 'juicy' ? (
              <div 
                className="card ad-container" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center', 
                  backgroundColor: '#000',
                  border: '2px solid red', // デバッグ用
                  minHeight: '140px',
                  position: 'relative'
                }}
                ref={(element) => {
                  console.log(`🎯 Rendering JuicyAds ad:`, { 
                    itemId: item.id, 
                    adId: item.adId, 
                    adProvider: item.adProvider,
                    cycle: item.cycle 
                  });
                  
                  // JuicyAdsスクリプトとINS要素の手動初期化
                  if (element && typeof window !== 'undefined' && window.adsbyjuicy) {
                    const uniqueId = `juicy-${item.cycle}-${item.originalIndex}`;
                    const insElement = element.querySelector(`ins[data-juicy-id="${uniqueId}"]`);
                    if (insElement && insElement.getAttribute('data-juicy-initialized') !== 'true') {
                      console.log('🔥 Manual JuicyAds initialization attempt for:', uniqueId);
                      try {
                        // JuicyAdsに広告ゾーンを登録
                        window.adsbyjuicy.push({'adzone': 1099712});
                        insElement.setAttribute('data-juicy-initialized', 'true');
                        console.log('🎯 Manual initialization completed for:', uniqueId);
                        
                        // JuicyAds広告監視とフォールバック
                        setTimeout(() => {
                          if (insElement && insElement.innerHTML.trim() === '') {
                            console.log('⚠️ Manual JuicyAds not displaying, attempting alternate method');
                            // 代替的な実装方法を試行
                            const altScript = document.createElement('script');
                            altScript.innerHTML = `
                              try {
                                if (window.adsbyjuicy && window.adsbyjuicy.length > 0) {
                                  window.adsbyjuicy.push({'adzone': 1099712});
                                }
                              } catch(e) { console.log('Alt method failed:', e); }
                            `;
                            document.head.appendChild(altScript);
                            
                            // 5秒後にフォールバック表示
                            setTimeout(() => {
                              if (insElement && insElement.innerHTML.trim() === '') {
                                console.log('🎨 Showing manual fallback for:', uniqueId);
                                (insElement as HTMLElement).style.backgroundColor = '#1a1a1a';
                                insElement.innerHTML = '<div style="color:#888;font-size:11px;text-align:center;padding:10px;">JuicyAds 1099712<br>Loading...</div>';
                              }
                            }, 5000);
                          }
                        }, 2000);
                      } catch (error) {
                        console.error('❌ Manual initialization error:', error);
                      }
                    }
                  }
                }}
              >
                {/* JuicyAds v3.0 - 公式形式 */}
                <ins 
                  id="1099712" 
                  data-juicy-id={`juicy-${item.cycle}-${item.originalIndex}`}
                  data-width="108" 
                  data-height="140"
                  data-juicy-initialized="false"
                  style={{ 
                    display: 'block', 
                    backgroundColor: 'blue', // デバッグ用
                    width: '108px',
                    height: '140px',
                    margin: '0 auto'
                  }}
                ></ins>
                <div style={{ color: 'white', fontSize: '12px', position: 'absolute', bottom: '5px', right: '5px' }}>
                  JuicyAds 1099712
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
