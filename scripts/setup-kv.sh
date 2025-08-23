#!/bin/bash

# Setup script for Cloudflare Workers KV
echo "Setting up Cloudflare Workers KV..."

# Create KV namespace
echo "Creating KV namespace..."
wrangler kv:namespace create "VIDEOS"

# Sample data for KV (you should replace with actual data)
echo "Adding sample data to KV..."

# Video 1
wrangler kv:key put --binding=VIDEOS "v1" '{
  "offer": {
    "name": "FANZA", 
    "url": "https://example.com/fanza?affid=XXXX"
  }
}'

# Video 2  
wrangler kv:key put --binding=VIDEOS "v2" '{
  "offer": {
    "name": "DMM",
    "url": "https://example.com/dmm?affid=YYYY" 
  }
}'

# Video 3
wrangler kv:key put --binding=VIDEOS "v3" '{
  "offer": {
    "name": "AdultSite",
    "url": "https://example.com/adultsite?affid=ZZZZ"
  }
}'

echo "KV setup complete!"
echo ""
echo "Next steps:"
echo "1. Update wrangler.toml with the KV namespace ID from the output above"
echo "2. Set your Plausible endpoint: wrangler secret put PLAUSIBLE_ENDPOINT"
echo "3. Deploy: wrangler deploy"