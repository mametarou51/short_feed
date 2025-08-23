"use client";
import { useEffect, useState, useCallback } from 'react';
import { Video } from '@/types/video';

type UserBehavior = {
  videoId: string;
  action: 'view' | 'skip' | 'complete' | 'click';
  duration?: number;
  timestamp: number;
};

type UserProfile = {
  preferredGenres: { [key: string]: number };
  preferredStudios: { [key: string]: number };
  preferredMoods: { [key: string]: number };
  preferredTimeOfDay: { [key: string]: number };
  preferredDifficulty: { [key: string]: number };
  avgWatchTime: number;
  totalInteractions: number;
};

export default function useRecommendationAlgorithm() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    preferredGenres: {},
    preferredStudios: {},
    preferredMoods: {},
    preferredTimeOfDay: {},
    preferredDifficulty: {},
    avgWatchTime: 0,
    totalInteractions: 0,
  });

  // ローカルストレージからユーザープロファイルを読み込み
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  // ユーザープロファイルをローカルストレージに保存
  const saveUserProfile = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }, []);

  // ユーザー行動を記録し、プロファイルを更新
  const trackUserBehavior = useCallback((behavior: UserBehavior, video: Video) => {
    const updatedProfile = { ...userProfile };
    updatedProfile.totalInteractions += 1;

    // 行動に基づいてスコアを調整
    const weight = getActionWeight(behavior.action, behavior.duration || 0, video.attributes.duration);
    
    // ジャンル学習
    video.attributes.genre.forEach(genre => {
      updatedProfile.preferredGenres[genre] = (updatedProfile.preferredGenres[genre] || 0) + weight;
    });

    // スタジオ学習
    updatedProfile.preferredStudios[video.attributes.studio] = 
      (updatedProfile.preferredStudios[video.attributes.studio] || 0) + weight;

    // ムード学習
    video.attributes.mood.forEach(mood => {
      updatedProfile.preferredMoods[mood] = (updatedProfile.preferredMoods[mood] || 0) + weight;
    });

    // 時間帯学習
    const currentHour = new Date().getHours();
    const currentTimeSlot = getTimeSlot(currentHour);
    video.attributes.timeOfDay.forEach(timeSlot => {
      if (timeSlot === currentTimeSlot) {
        updatedProfile.preferredTimeOfDay[timeSlot] = 
          (updatedProfile.preferredTimeOfDay[timeSlot] || 0) + weight * 1.5; // 時間帯マッチに追加ボーナス
      }
    });

    // 難易度学習
    updatedProfile.preferredDifficulty[video.attributes.difficulty] = 
      (updatedProfile.preferredDifficulty[video.attributes.difficulty] || 0) + weight;

    // 平均視聴時間の更新
    if (behavior.duration) {
      updatedProfile.avgWatchTime = 
        (updatedProfile.avgWatchTime * (updatedProfile.totalInteractions - 1) + behavior.duration) / 
        updatedProfile.totalInteractions;
    }

    saveUserProfile(updatedProfile);
  }, [userProfile, saveUserProfile]);

  // 動画の推薦スコアを計算
  const calculateRecommendationScore = useCallback((video: Video): number => {
    let score = 0;

    // 基本人気度スコア (0-1)
    score += video.attributes.popularity / 10;

    // ジャンル適合度 (0-2)
    const genreScore = video.attributes.genre.reduce((sum, genre) => {
      return sum + (userProfile.preferredGenres[genre] || 0);
    }, 0) / Math.max(video.attributes.genre.length, 1);
    score += Math.min(genreScore / 10, 2);

    // スタジオ適合度 (0-1)
    const studioScore = (userProfile.preferredStudios[video.attributes.studio] || 0) / 10;
    score += Math.min(studioScore, 1);

    // ムード適合度 (0-1.5)
    const moodScore = video.attributes.mood.reduce((sum, mood) => {
      return sum + (userProfile.preferredMoods[mood] || 0);
    }, 0) / Math.max(video.attributes.mood.length, 1);
    score += Math.min(moodScore / 10, 1.5);

    // 時間帯適合度 (0-2)
    const currentHour = new Date().getHours();
    const currentTimeSlot = getTimeSlot(currentHour);
    const timeScore = video.attributes.timeOfDay.includes(currentTimeSlot) ? 
      (userProfile.preferredTimeOfDay[currentTimeSlot] || 0) / 5 : 0;
    score += Math.min(timeScore, 2);

    // 難易度適合度 (0-1)
    const difficultyScore = (userProfile.preferredDifficulty[video.attributes.difficulty] || 0) / 10;
    score += Math.min(difficultyScore, 1);

    // 新規性ボーナス (視聴履歴にない動画にボーナス) (0-1)
    const hasWatched = localStorage.getItem(`watched_${video.id}`);
    if (!hasWatched) {
      score += 1;
    }

    // 適切な長さボーナス (0-0.5)
    const durationFit = 1 - Math.abs(video.attributes.duration - userProfile.avgWatchTime) / 300;
    score += Math.max(durationFit * 0.5, 0);

    // 最新性ボーナス (0-0.5)
    const releaseDate = new Date(video.attributes.releaseDate);
    const daysSinceRelease = (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
    const recencyBonus = Math.max(0.5 - daysSinceRelease / 365, 0);
    score += recencyBonus;

    return Math.max(score, 0.1); // 最小スコア保証
  }, [userProfile]);

  // 推薦アルゴリズムでソート
  const sortVideosByRecommendation = useCallback((videos: Video[]): Video[] => {
    return [...videos].sort((a, b) => {
      const scoreA = calculateRecommendationScore(a);
      const scoreB = calculateRecommendationScore(b);
      
      // スコアが同じ場合はランダム要素を追加
      if (Math.abs(scoreA - scoreB) < 0.1) {
        return Math.random() - 0.5;
      }
      
      return scoreB - scoreA;
    });
  }, [calculateRecommendationScore]);

  return {
    userProfile,
    trackUserBehavior,
    sortVideosByRecommendation,
    calculateRecommendationScore
  };
}

// ヘルパー関数
function getActionWeight(action: string, watchDuration: number, totalDuration: number): number {
  switch (action) {
    case 'skip':
      return watchDuration < totalDuration * 0.1 ? -2 : -0.5;
    case 'view':
      return watchDuration / totalDuration * 3; // 視聴率に基づく重み
    case 'complete':
      return 5;
    case 'click':
      return 3;
    default:
      return 0;
  }
}

function getTimeSlot(hour: number): string {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  if (hour >= 22 || hour < 2) return 'night';
  return 'late_night';
}