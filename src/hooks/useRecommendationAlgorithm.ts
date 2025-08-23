"use client";
import { useState, useCallback } from 'react';
import { Video } from '@/types/video';

type UserBehavior = {
  videoId: string;
  action: 'view' | 'skip' | 'complete' | 'click';
  duration?: number;
  timestamp: number;
};

type UserProfile = {
  preferredGenres: { [key: string]: number };
  preferredCategories: { [key: string]: number };
  totalInteractions: number;
};

export default function useRecommendationAlgorithm() {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userProfile');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // エラーの場合はデフォルト値を使用
        }
      }
    }
    return {
      preferredGenres: {},
      preferredCategories: {},
      totalInteractions: 0,
    };
  });

  const trackUserBehavior = useCallback((behavior: UserBehavior, video: Video) => {
    console.log('User behavior tracked:', behavior, video.title);
    
    // 行動に基づく重み
    let weight = 1;
    switch (behavior.action) {
      case 'complete':
        weight = 3;
        break;
      case 'view':
        weight = 2;
        break;
      case 'click':
        weight = 2;
        break;
      case 'skip':
        weight = -1;
        break;
    }

    const updatedProfile = { ...userProfile };
    
    // カテゴリ学習
    if (video.category) {
      updatedProfile.preferredCategories[video.category] = 
        (updatedProfile.preferredCategories[video.category] || 0) + weight;
    }
    
    // タグ学習
    if (video.tags) {
      video.tags.forEach(tag => {
        updatedProfile.preferredGenres[tag] = 
          (updatedProfile.preferredGenres[tag] || 0) + weight;
      });
    }
    
    updatedProfile.totalInteractions++;
    
    setUserProfile(updatedProfile);
    
    // LocalStorageに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      // 行動履歴も保存
      const history = JSON.parse(localStorage.getItem('userBehavior') || '[]');
      history.push({
        ...behavior,
        videoTitle: video.title,
        category: video.category
      });
      
      // 最新100件のみ保持
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      localStorage.setItem('userBehavior', JSON.stringify(history));
    }
  }, [userProfile]);

  const calculateVideoScore = useCallback((video: Video): number => {
    let score = Math.random() * 0.5; // ベーススコア
    
    // カテゴリスコア
    if (video.category && userProfile.preferredCategories[video.category]) {
      score += userProfile.preferredCategories[video.category] / 10;
    }
    
    // タグスコア
    if (video.tags && video.tags.length > 0) {
      const tagScore = video.tags.reduce((sum, tag) => {
        return sum + (userProfile.preferredGenres[tag] || 0);
      }, 0) / video.tags.length;
      score += tagScore / 20;
    }
    
    // 公式コンテンツには少しボーナス
    if (video.isOfficial) {
      score += 0.1;
    }
    
    return Math.max(0, score);
  }, [userProfile]);

  const sortVideosByRecommendation = useCallback((videos: Video[]): Video[] => {
    if (!videos || videos.length === 0) return [];
    
    // 初回訪問者や学習データが少ない場合はランダム
    if (userProfile.totalInteractions < 5) {
      return [...videos].sort(() => Math.random() - 0.5);
    }
    
    // スコアに基づいてソート
    return videos
      .map(video => ({
        video,
        score: calculateVideoScore(video)
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.video);
  }, [userProfile, calculateVideoScore]);

  return {
    userProfile,
    trackUserBehavior,
    sortVideosByRecommendation,
  };
}
