/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Note: headers are managed via `public/_headers` for static hosting (e.g. Cloudflare Pages)
}

module.exports = nextConfig;