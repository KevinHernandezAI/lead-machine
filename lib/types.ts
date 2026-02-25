import { z } from 'zod';

export const landingConfigSchema = z.object({
  hero: z.object({
    headline: z.string().min(5),
    subheadline: z.string().min(5),
    ctaText: z.string().min(2),
    backgroundImage: z.string().url()
  }),
  services: z.array(z.object({ title: z.string(), description: z.string() })).min(3),
  pricing: z.array(z.object({ name: z.string(), price: z.string(), details: z.string() })).min(3),
  testimonials: z.array(z.object({ name: z.string(), quote: z.string() })).min(2),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).min(2),
  serviceAreaText: z.string()
});

export type LandingConfig = z.infer<typeof landingConfigSchema>;

export const leadSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(7).max(30),
  email: z.string().email().optional().or(z.literal('')),
  serviceType: z.string().min(2),
  address: z.string().min(5),
  preferredDate: z.string().optional(),
  notes: z.string().max(1000).optional()
});
