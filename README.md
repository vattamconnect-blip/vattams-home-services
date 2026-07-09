# VATTAMS HOME SERVICES

A production-ready, mobile-first service booking platform with three integrated applications: Customer App, Technician App, and Admin Panel.

## Features

### Customer App (`/customer`)
- Mobile OTP authentication
- Browse services by category
- Book home services with preferred date/time
- Track booking status in real-time
- View booking history
- Rate completed services
- Profile management

### Technician App (`/technician`)
- Mobile OTP authentication
- Online/offline status toggle
- View today's jobs and history
- Accept/reject job assignments
- Navigate to customer location
- Call/WhatsApp support
- Update job status (On the Way → Started → Completed)
- Track parts used
- View earnings (daily/weekly/monthly)
- Profile management with skills

### Admin Panel (`/admin`)
- Password-protected dashboard
- Real-time statistics
- Customer management
- Technician management (approve/suspend)
- Booking management with technician assignment
- Service and category management
- Banner management
- Coupon management
- Payment history
- Reviews analytics
- Revenue reports

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (Auth, Database, RLS)
- **PWA**: Ready for Android Play Store

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vattams-home-services.git
cd vattams-home-services
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Start development server:
```bash
npm run dev
```

### Supabase Setup

The database schema will be applied automatically. To enable phone OTP:

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Phone** provider
3. Configure SMS provider (Twilio recommended for production)

**For Development/Testing:**
- Supabase shows OTP in Dashboard logs: Authentication → Logs
- Or enable "Skip SMS verification" for testing

## Database Schema

Tables with Row Level Security (RLS):
- `categories`, `services`, `banners`
- `customers`, `technicians`
- `bookings`, `booking_images`
- `payments`, `reviews`, `notifications`
- `coupons`, `invoices`, `app_settings`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel: https://vercel.com/new
3. Add environment variables
4. Deploy

### Environment Variables

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |

## Configuration

### Phone Authentication Setup

See [SETUP.md](./SETUP.md) for detailed Supabase phone auth configuration.

**Quick Steps:**
1. Supabase Dashboard → Authentication → Providers
2. Enable Phone provider
3. Add Twilio credentials (for production SMS)
4. Or use dev mode (check Auth logs for OTP)

### Admin Access

**Email:** admin@vattams.net  
**Password:** Admin@123

First time setup:
1. Go to `/admin`
2. Click "Create Admin Account"
3. Sign in with the credentials above

**Important:** Change the admin password after first login in production!

## Services Pre-configured

- AC Installation, Service, Deep Cleaning, Gas Refill
- Refrigerator Repair
- Washing Machine Repair
- CCTV Installation
- Electrical Services
- Plumbing Services

## Documentation

- [Setup Guide](./SETUP.md) - Detailed configuration
- [Supabase Docs](https://supabase.com/docs) - Backend reference

## License

MIT License
