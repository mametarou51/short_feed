"use client";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import DugaEmbedCard from "@/components/DugaEmbedCard";
import { useVideos } from "@/hooks/useVideos";
import useRecommendationAlgorithm from "@/hooks/useRecommendationAlgorithm";
import type { Video } from "@/types/video";

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
  const [displayedContent, setDisplayedContent] = useState<ContentItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { videos, loading, error } = useVideos();
  const { sortVideosByRecommendation, trackUserBehavior } = useRecommendationAlgorithm();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    setOk(!!localStorage.getItem("agreed18"));
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
  const generateContentBatch = useCallback((startIndex: number, batchSize: number = 20): ContentItem[] => {
    if (!shuffledVideos || shuffledVideos.length === 0) return [];
    
    // 動画リストを作成（重複を避けるためにstartIndexから開始）
    const availableVideos = [...shuffledVideos, ...shuffledVideos]; // 2回分の動画を用意
    const startVideoIndex = startIndex % shuffledVideos.length;
    const endVideoIndex = Math.min(startVideoIndex + batchSize, startVideoIndex + batchSize);
    
    const content: ContentItem[] = [];
    
    // 指定された範囲の動画を取得
    for (let i = 0; i < batchSize; i++) {
      const videoIndex = (startVideoIndex + i) % shuffledVideos.length;
      const video = availableVideos[videoIndex];
      
      if (video && video.type === 'duga_iframe') {
        content.push({
          type: 'video' as const,
          id: `${video.id}-${startIndex}-${i}`, // 重複を避けるためのユニークID
          content: video,
          originalIndex: videoIndex
        });
      }
    }
    
    // 広告を動画の数に応じて複数挿入
    const adInterval = Math.max(5, Math.floor(content.length / 10));
    let adCount = 0;
    for (let i = adInterval; i < content.length; i += adInterval) {
      content.splice(i, 0, {
        type: 'ad',
        id: `ad-${startIndex}-${i}-${adCount}`,
        adId: adCount % 2 === 0 ? '01' : '02',
        content: null,
        originalIndex: i
      });
      adCount++;
    }
    
    // このバッチ内でシャッフル
    for (let i = content.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [content[i], content[j]] = [content[j], content[i]];
    }
    
    return content;
  }, [shuffledVideos]);

  // 初期コンテンツを設定
  useEffect(() => {
    if (shuffledVideos.length > 0) {
      const initialContent = generateContentBatch(0, 20);
      setDisplayedContent(initialContent);
      setCurrentPage(1);
    }
  }, [shuffledVideos, generateContentBatch]);

  // 無限スクロール用のIntersection Observer
  useEffect(() => {
    if (!loadingRef.current || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMoreContent();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;
    observer.observe(loadingRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoadingMore]);

  // 追加コンテンツを読み込む
  const loadMoreContent = useCallback(async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    // 少し遅延を入れてスムーズな読み込みを演出
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newContent = generateContentBatch(currentPage * 20, 20);
    setDisplayedContent(prev => [...prev, ...newContent]);
    setCurrentPage(prev => prev + 1);
    setIsLoadingMore(false);
  }, [currentPage, generateContentBatch, isLoadingMore]);

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
          ) : null}
        </div>
      ))}
      
      {/* 無限スクロール用のローディング要素 */}
      <div ref={loadingRef} className="loading-more" style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        {isLoadingMore ? '動画を読み込み中...' : 'スクロールでさらに読み込み'}
      </div>
    </main>
  );
}
