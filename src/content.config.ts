import { defineCollection, z } from 'astro:content';

const works = defineCollection({
  type: 'data',
  schema: z.object({
    works: z.array(
      z.object({
        title: z.string(),
        year: z.number(),
        role: z.string().optional(),
        category: z.enum(['Movie', 'TV', 'Stage', 'CM', 'Other']),
        director: z.string().optional(),
        url: z.string().optional(),
        note: z.string().optional(),
      })
    ),
  }),
});

const profile = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    nameEn: z.string().optional(),
    birthday: z.string().optional(),
    birthplace: z.string().optional(),
    height: z.string().optional(),
    sizes: z.string().optional(),
    bloodType: z.string().optional(),
    agency: z.string().optional(),
    agencyUrl: z.string().optional(),
    skills: z.array(z.string()).optional(),
    qualifications: z.array(z.string()).optional(),
    hobbies: z.array(z.string()).optional(),
    photo: z.string().optional(),
    sns: z
      .object({
        twitter: z.string().optional(),
        instagram: z.string().optional(),
        youtube: z.string().optional(),
        tiktok: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { works, profile };
