import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  
  // Site configuration
  SITE_ORIGIN: z.string().url().default('https://yourdomain.tld'),
  BOOKING_LINK: z.string().url().default('https://calendly.com/omraanalshibany/new-meeting-1'),
  INTAKE_LINK: z.string().url().default('https://forms.fillout.com/t/wNTePVM9DPus'),
  CONTACT_EMAIL: z.string().email().default('omraanalshibany@gmail.com'),
  CONTACT_PHONE: z.string().default('+963996905457'),
  INSTAGRAM_URL: z.string().url().default('https://www.instagram.com/dentclinicai?igsh=MXNsNnVrZmpsbXll'),
  
  // Cities configuration
  CITIES_UK: z.string().default('London,Manchester,Birmingham'),
  CITIES_US: z.string().default('New York,Los Angeles,Chicago'),
  CITIES_UAE: z.string().default('Dubai,Abu Dhabi,Sharjah'),
  
  // SMTP configuration (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Webhook tokens (optional)
  N8N_TOKEN: z.string().optional(),
  CALENDLY_SIGNING_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);