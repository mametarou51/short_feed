import { z } from 'zod';

export const OfferSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
});

export const VideoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  posterUrl: z.string().url(),
  videoUrl: z.string().url(),
  offer: OfferSchema,
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  duration: z.string().optional(),
  isOfficial: z.boolean().optional(),
});

export const VideosArraySchema = z.array(VideoSchema);

export type Offer = z.infer<typeof OfferSchema>;
export type Video = z.infer<typeof VideoSchema>;
export type VideosArray = z.infer<typeof VideosArraySchema>;