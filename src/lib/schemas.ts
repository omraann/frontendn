import { z } from 'zod';

export const roiSchema = z.object({
  revenuePerPatient: z.number().min(0),
  missedPerDay: z.number().min(0),
  capturePct: z.number().min(0).max(100),
  showRatePct: z.number().min(0).max(100),
});

export const contactSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  clinic: z.string().min(1).max(200),
  cityCountry: z.string().min(1).max(100),
  contactMethod: z.enum(['Phone', 'Text message', 'WhatsApp', 'Email']),
  phone: z.string().optional(),
  email: z.string().email(),
  message: z.string().max(1000).optional(),
});

export type RoiRequest = z.infer<typeof roiSchema>;
export type ContactRequest = z.infer<typeof contactSchema>;