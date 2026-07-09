# VATTAMS HOME SERVICES - Setup Guide

## Authentication

This app uses email/password authentication (Supabase Auth). No SMS provider configuration needed.

### Customer App
1. Navigate to `/customer`
2. Sign up with email and password
3. Complete your profile on the setup page
4. Start booking services

### Technician App
1. Navigate to `/technician`
2. Sign up with email and password
3. Complete your profile on the setup page
4. Start managing jobs

### Admin Panel
1. Navigate to `/admin`
2. Sign in with the admin credentials below
3. The admin account is pre-created and ready to use

## Admin Account

**Email:** admin@vattams.net  
**Password:** Admin@123

The admin account is created automatically via the `init-admin` edge function. It is pre-confirmed (no email verification needed) and has the `super_admin` role.

**Important:** Change the admin password after first login in production.

## Database

All migrations are applied automatically. Tables include:
- customers, technicians, bookings, services, categories
- payments, reviews, notifications, coupons, invoices
- banners, booking_images, app_settings, admins

All tables have Row Level Security (RLS) enabled with:
- Owner-scoped policies for customers and technicians
- Admin full-access policies on all tables
- Public read access for categories, services, banners, coupons, and reviews

## Storage

A public storage bucket `uploads` is created for file uploads (profile images, booking photos, banners).

## Environment Variables

The following are required in `.env` (or Vercel environment variables):
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Deployment

The project is configured for Vercel deployment with `vercel.json`. Push to GitHub and import the repo in Vercel.
