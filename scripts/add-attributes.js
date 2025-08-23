const fs = require('fs');
const path = require('path');

const videosPath = path.join(__dirname, '../public/videos.json');
const videos = JSON.parse(fs.readFileSync(videosPath, 'utf8'));

const studios = ['S1', 'MOODYZ', 'SONE', 'PRED', 'IPZZ', 'JUR', 'YUJ', 'YMDD'];
const genres = [
  ['solo', 'beauty'],
  ['threesome', 'group'],
  ['mature', 'milf'],
  ['schoolgirl', 'uniform'],
  ['compilation', 'best_of'],
  ['drama', 'story'],
  ['pov', 'interactive'],
  ['fetish', 'specialty']
];
const difficulties = ['beginner', 'intermediate', 'advanced'];
const timeSlots = [
  ['morning', 'afternoon'],
  ['afternoon', 'evening'],
  ['evening', 'night'],
  ['night', 'late_night']
];
const moods = [
  ['energetic', 'upbeat'],
  ['relaxed', 'story_driven'],
  ['intense', 'passionate'],
  ['variety', 'highlights'],
  ['romantic', 'gentle'],
  ['wild', 'adventurous']
];

const updatedVideos = videos.map((video, index) => {
  if (video.attributes) return video; // Skip if already has attributes
  
  const studioIndex = index % studios.length;
  const genreIndex = index % genres.length;
  const difficultyIndex = index % difficulties.length;
  const timeIndex = index % timeSlots.length;
  const moodIndex = index % moods.length;
  
  return {
    ...video,
    attributes: {
      studio: studios[studioIndex],
      genre: genres[genreIndex],
      tags: ['人気', 'おすすめ', '高画質'],
      duration: 120 + (index * 20) % 200, // 120-320 minutes
      releaseDate: new Date(2024, index % 12, (index % 28) + 1).toISOString().split('T')[0],
      difficulty: difficulties[difficultyIndex],
      popularity: 6.0 + (index * 0.3) % 4.0, // 6.0-10.0
      timeOfDay: timeSlots[timeIndex],
      mood: moods[moodIndex]
    }
  };
});

fs.writeFileSync(videosPath, JSON.stringify(updatedVideos, null, 2));
console.log(`Updated ${updatedVideos.length} videos with attributes`);