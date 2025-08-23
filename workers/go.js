export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const videoId = url.pathname.split('/').pop();

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Validate video ID
    if (!videoId || videoId === 'go') {
      return Response.redirect(url.origin + '/', 302);
    }

    try {
      // Get video data from KV
      const videoData = await env.VIDEOS.get(videoId, { type: 'json' });
      
      if (!videoData || !videoData.offer || !videoData.offer.url) {
        console.log(`Video ${videoId} not found in KV`);
        return Response.redirect(url.origin + '/', 302);
      }

      // Prepare analytics event data
      const eventData = {
        name: 'click_out',
        url: request.headers.get('referer') || url.origin + '/',
        domain: env.PLAUSIBLE_DOMAIN || 'localhost',
        props: {
          videoId: videoId,
          country: request.headers.get('cf-ipcountry') || 'unknown',
          ua: request.headers.get('user-agent') || 'unknown'
        }
      };

      // Send analytics event asynchronously
      if (env.PLAUSIBLE_ENDPOINT) {
        ctx.waitUntil(
          fetch(env.PLAUSIBLE_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': request.headers.get('user-agent') || 'CloudflareWorker/1.0',
            },
            body: JSON.stringify(eventData),
          }).catch(error => {
            console.error('Analytics error:', error);
          })
        );
      }

      // Log the click event
      console.log(`Redirecting video ${videoId} to ${videoData.offer.url}`);

      // Perform the redirect
      return Response.redirect(videoData.offer.url, 302);
      
    } catch (error) {
      console.error('Worker error:', error);
      return Response.redirect(url.origin + '/', 302);
    }
  },
};