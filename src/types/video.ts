import { z } from 'zod';

export const OfferSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
});

export const VideoSchema = z.object({
  id: z.string().min(1),
  type: z.string().optional(),
  title: z.string().min(1),
  desc: z.string().optional(),
  embedSrc: z.string().url(),
  offer: OfferSchema,
  description: z.string().optional(),
  seoDescription: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  duration: z.string().optional(),
  isOfficial: z.boolean().optional(),
  attributes: z.object({
    studio: z.string().optional(),
    genre: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    duration: z.number().optional(),
    releaseDate: z.string().optional(),
    difficulty: z.string().optional(),
    popularity: z.number().optional(),
    timeOfDay: z.array(z.string()).optional(),
    mood: z.array(z.string()).optional(),
  }).optional(),
  videoUrl: z.string().url().optional(),
});

export const VideosArraySchema = z.array(VideoSchema);

export type Offer = z.infer<typeof OfferSchema>;
export type Video = z.infer<typeof VideoSchema> & {
  videoUrl?: string;
};
export type VideosArray = z.infer<typeof VideosArraySchema>;