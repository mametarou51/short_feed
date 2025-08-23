# Short Video Site

A vertical scrolling short video platform with affiliate link tracking, built with Next.js and Cloudflare Workers.

## Features

- 📱 Mobile-first vertical scrolling interface (TikTok/YouTube Shorts style)
- 🎥 HLS video streaming with auto-play/pause based on visibility
- 🔗 Click tracking and affiliate link redirection via Cloudflare Workers
- 🛡️ Age verification gate (18+ content)
- 📊 Analytics integration with Plausible
- ⚡ Fast CDN delivery via bunny.net

## Architecture

- **Frontend**: Next.js 14 (App Router, TypeScript)
- **Video CDN**: bunny.net (HLS streaming)
- **Click Tracking**: Cloudflare Workers + KV storage
- **Analytics**: Plausible
- **Hosting**: Cloudflare Pages / Vercel

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Cloudflare account (for Workers deployment)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   Access the site at `http://localhost:3000`

3. **Configure video data:**
   Edit `/public/videos.json` with your video metadata:
   ```json
   [
     {
       "id": "v1",
       "title": "Your Video Title",
       "posterUrl": "https://example.com/poster.jpg",
       "videoUrl": "https://example.com/video.m3u8",
       "offer": {
         "name": "Site Name",
         "url": "https://affiliate-url.com"
       }
     }
   ]
   ```

## Cloudflare Workers Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 2. Set up KV Storage

```bash
# Create KV namespace
wrangler kv:namespace create "VIDEOS"

# Update wrangler.toml with the returned namespace ID
# Add video data to KV
wrangler kv:key put --binding=VIDEOS "v1" '{
  "offer": {
    "name": "Example Site",
    "url": "https://example.com/affiliate-link"
  }
}'
```

### 3. Configure Environment Variables

```bash
# Set analytics endpoint (optional)
wrangler secret put PLAUSIBLE_ENDPOINT
# Enter: https://plausible.yourdomain.com/api/event

# Update vars in wrangler.toml
[vars]
PLAUSIBLE_DOMAIN = "yourdomain.com"
```

### 4. Deploy Workers

```bash
wrangler deploy
```

The Worker will handle `/go/:id` routes for click tracking and redirection.

## Video CDN Setup (bunny.net)

1. Create a Video Library in bunny.net
2. Upload your video files
3. Enable HLS streaming
4. Copy the HLS URLs to your `videos.json`
5. Set up poster images for better loading experience

## Analytics Setup (Plausible)

1. Create account at https://plausible.io
2. Add your domain
3. Configure the API endpoint in Workers environment
4. Track `click_out` events with video ID metadata

## Deployment

### Frontend (Cloudflare Pages)

```bash
# Build the app
npm run build

# Deploy to Pages (set up in Cloudflare dashboard)
# or use wrangler:
wrangler pages deploy dist
```

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Content Guidelines

⚠️ **Important**: This platform is designed for adult content. Please ensure:

- All content has proper licensing/rights clearance
- Age verification is properly implemented for your jurisdiction
- Content moderation and takedown procedures are in place
- Terms of service and privacy policy are added

## File Structure

```
├── public/
│   └── videos.json          # Video metadata
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Main video feed
│   │   └── go/[id]/route.ts # Click tracking API
│   ├── components/
│   │   ├── VideoPlayer.tsx  # HLS video player
│   │   ├── VideoContainer.tsx # Intersection observer wrapper
│   │   └── AgeGate.tsx      # Age verification modal
│   ├── hooks/
│   │   └── useVideos.ts     # Video data fetching
│   └── types/
│       └── video.ts         # TypeScript definitions
├── workers/
│   └── go.js               # Cloudflare Worker for redirects
├── scripts/
│   └── setup-kv.sh         # KV setup helper
└── wrangler.toml           # Workers configuration
```

## API Endpoints

### GET `/videos.json`
Returns array of video metadata

### GET `/go/:id`
Handled by Cloudflare Workers:
- Logs click event to analytics
- Redirects to affiliate URL
- Returns 302 redirect response

## Performance Optimizations

- HLS.js loaded dynamically only when needed
- IntersectionObserver for efficient auto-play/pause
- Scroll snap for smooth UX
- Lazy loading of video elements
- CDN delivery for fast global access

## Security Considerations

- Age verification (soft gate via localStorage)
- CORS headers properly configured
- No direct affiliate URL exposure in frontend
- Input validation on all data sources
- Content Security Policy headers

## License

This project is for educational/demonstration purposes. Please ensure compliance with local laws and regulations before deploying for adult content.