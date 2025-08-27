# DentClinicAI Backend

A secure, production-ready REST API backend for DentClinicAI built with Fastify, TypeScript, and serverless compatibility.

## Features

- 🚀 **Fast & Lightweight**: Built with Fastify for optimal performance
- 🔒 **Security First**: Helmet, CORS, rate limiting, and input validation
- 📊 **Machine-Readable**: Structured JSON responses for AI assistants
- 🌐 **Serverless Ready**: Compatible with Vercel, Netlify, and Cloudflare Workers
- 🧪 **Well Tested**: Comprehensive Jest test suite
- 📝 **Type Safe**: Full TypeScript with strict mode enabled
- 📁 **File-Based Storage**: No database required, uses memory + flat files

## Quick Start

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Public Endpoints (GET - CORS: *)

- `GET /api/answer` - Canonical summary and policy URL
- `GET /api/facts` - Site configuration and contact info
- `GET /api/qa` - FAQ data
- `GET /api/dataset` - CSV performance metrics
- `GET /healthz` - Health check

### Restricted Endpoints (POST - CORS: SITE_ORIGIN only)

- `POST /api/roi` - ROI calculator
- `POST /api/contact` - Contact form submission
- `POST /api/webhooks/n8n` - N8N webhook (optional)
- `POST /api/webhooks/calendly` - Calendly webhook (optional)

## Sample API Calls

### Get Answer Summary
```bash
curl https://yourdomain.tld/api/answer
```

### Calculate ROI
```bash
curl -X POST https://yourdomain.tld/api/roi \
  -H "content-type: application/json" \
  -d '{
    "revenuePerPatient": 300,
    "missedPerDay": 8,
    "capturePct": 30,
    "showRatePct": 80
  }'
```

### Submit Contact Form
```bash
curl -X POST https://yourdomain.tld/api/contact \
  -H "content-type: application/json" \
  -d '{
    "name": "Dr A",
    "role": "Owner",
    "clinic": "Bright Dental",
    "cityCountry": "London, UK",
    "contactMethod": "Email",
    "email": "owner@example.com",
    "message": "Audit"
  }'
```

## Environment Variables

### Required
- `SITE_ORIGIN` - Your domain for CORS (default: https://yourdomain.tld)
- `CONTACT_EMAIL` - Email for contact form submissions

### Optional
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `BOOKING_LINK` - Calendly booking URL
- `INTAKE_LINK` - Intake form URL
- `CONTACT_PHONE` - Contact phone number
- `INSTAGRAM_URL` - Instagram profile URL
- `CITIES_UK/US/UAE` - Comma-separated city lists

### SMTP (Optional)
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password

### Webhooks (Optional)
- `N8N_TOKEN` - N8N webhook authentication token
- `CALENDLY_SIGNING_SECRET` - Calendly webhook signature verification

## File Structure

```
src/
├── lib/
│   ├── env.ts          # Environment configuration
│   ├── schemas.ts      # Zod validation schemas
│   ├── mailer.ts       # Email functionality
│   ├── rateLimit.ts    # Rate limiting setup
│   └── logger.ts       # Logging utilities
├── routes/
│   ├── answer.ts       # Answer endpoint
│   ├── facts.ts        # Facts endpoint
│   ├── qa.ts           # Q&A endpoint
│   ├── dataset.ts      # Dataset endpoint
│   ├── roi.ts          # ROI calculator
│   ├── contact.ts      # Contact form
│   ├── webhooks.ts     # Webhook handlers
│   └── healthz.ts      # Health check
└── server.ts           # Main server file

public/
├── facts.json          # Site facts (optional override)
├── qa.json             # Q&A data
└── dataset/
    └── response-time-and-bookings.csv

var/                    # Runtime data
├── leads.csv           # Contact form submissions
├── access.log          # Access logs
├── error.log           # Error logs
└── maildev.outbox/     # Email outbox (dev mode)
```

## Deployment

### Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard**

The `vercel.json` configuration is already included for serverless deployment.

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder to your hosting provider**

3. **Set environment variables on your hosting platform**

4. **Start with**
   ```bash
   npm start
   ```

## Security Features

- **Rate Limiting**: 60 requests/minute per IP
- **CORS**: Strict origin control for POST endpoints
- **Input Validation**: Zod schemas for all inputs
- **Helmet**: Security headers
- **Data Sanitization**: Email/phone redaction in logs
- **No PHI Storage**: Only basic contact info stored

## Data Storage

- **No Database Required**: Uses memory + flat files
- **Contact Forms**: Stored in `var/leads.csv`
- **Logs**: Access and error logs in `var/`
- **Email**: SMTP or file-based outbox for development

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

## Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking

## License

MIT License - see LICENSE file for details.