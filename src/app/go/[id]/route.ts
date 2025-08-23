import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Temporary redirect until Cloudflare Workers is set up
  // In production, this would be handled by Workers
  console.log(`Click tracked for video ${params.id}`);
  
  // For now, redirect to a placeholder
  return NextResponse.redirect('https://example.com', 302);
}