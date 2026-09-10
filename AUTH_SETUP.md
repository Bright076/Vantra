# Authentication & Referral System Setup

This guide explains how to set up and use the Supabase authentication system with referral tracking.

## Features

✅ Email/password authentication with Supabase  
✅ Automatic $2 welcome bonus + 20 points for all new users  
✅ Referral tracking with unique referral codes  
✅ $1 + 10 points referral reward (paid on first task completion)  
✅ Role-based access control (user/admin)  
✅ Protected routes with automatic redirects  
✅ Pending referral status until first task completion

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up

### 2. Run Database Migration

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run it in the SQL Editor
4. This will create:
   - `profiles` table (with balance, points, referral_code)
   - `referrals` table (tracking pending/paid referrals)
   - Row Level Security policies
   - Necessary indexes and triggers

### 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Get your Supabase credentials from Project Settings > API:
   - Project URL
   - Anon/Public key

3. Update `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 4. Install Dependencies (Already Done)

```bash
bun install
```

### 5. Run the Development Server

```bash
bun run dev
```

## Usage

### Signup Flow

**URL:** `/signup` or `/signup?ref=ABCD1234`

When a user signs up:
1. User creates account with email/password
2. A unique 8-character referral code is generated
3. User receives **$2.00 balance + 20 points** (welcome bonus)
4. If `?ref=CODE` parameter is present:
   - Look up the referrer by their referral code
   - Set `referred_by` field on new user's profile
   - Create a referral record with `status='pending'`
   - **Referrer is NOT credited yet** (must wait for first task completion)

### Login Flow

**URL:** `/login`

When a user logs in:
- Validates email/password
- Checks user's role from profile
- Redirects to:
  - `/admin` if role is 'admin'
  - `/dashboard` if role is 'user'

### Protected Routes

**User Dashboard:** `/dashboard`
- Shows balance, points, and referral code
- Displays referral link to share
- Auto-redirects admins to `/admin`

**Admin Dashboard:** `/admin`
- Admin-only access
- Auto-redirects regular users to `/dashboard`

**Auth Protection:**
- Unauthenticated users are redirected to `/login`
- Role-based redirects happen automatically

### Referral Payout

**When to trigger:** After a user completes their first task

**How to use:**

```typescript
import { processReferralPayout } from '@/lib/actions/referral-payout'

// After a task is successfully completed
async function completeTask(userId: string) {
  // ... your task completion logic ...
  
  // Process referral payout if applicable
  const referralProcessed = await processReferralPayout(userId)
  
  if (referralProcessed) {
    console.log('Referrer was credited $1 + 10 points!')
  }
}
```

**What it does:**
1. Checks for a `pending` referral where `referred_id = userId`
2. If found, credits the referrer with $1 + 10 points
3. Updates referral status to `paid` and sets `paid_at` timestamp
4. Returns `true` if payout was processed, `false` if no pending referral

## Database Schema

### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,                    -- Matches auth.users(id)
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'user',          -- 'user' or 'admin'
  balance DECIMAL(10, 2) DEFAULT 0.00,
  points INTEGER DEFAULT 0,
  referral_code TEXT NOT NULL UNIQUE,     -- 8-char alphanumeric
  referred_by UUID,                       -- References profiles(id)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Referrals Table

```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY,
  referrer_id UUID NOT NULL,              -- Who sent the referral
  referred_id UUID NOT NULL UNIQUE,       -- Who was referred (1 referral per user)
  reward_amount DECIMAL(10, 2) DEFAULT 1.00,
  status referral_status DEFAULT 'pending', -- 'pending' or 'paid'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ                     -- Set when status changes to 'paid'
);
```

## Key Components

### Authentication Files

- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client (for RSC)
- `lib/supabase/middleware.ts` - Session management
- `middleware.ts` - Next.js middleware for auth

### Auth Pages

- `app/signup/page.tsx` - Registration with referral support
- `app/login/page.tsx` - Login with role-based redirect
- `app/dashboard/page.tsx` - User dashboard
- `app/admin/page.tsx` - Admin dashboard

### Utilities

- `lib/auth/protected-route.tsx` - Protected route wrapper
- `lib/auth/get-user.ts` - Get current user and profile
- `lib/utils/referral.ts` - Referral code generation
- `lib/actions/referral-payout.ts` - Process referral rewards

## Testing the Flow

1. **Sign up a referrer:**
   - Go to `/signup`
   - Create account as `user1@example.com`
   - Note the referral code on dashboard (e.g., `ABCD1234`)

2. **Sign up with referral:**
   - Go to `/signup?ref=ABCD1234`
   - Create account as `user2@example.com`
   - Check dashboard: should have $2 + 20 points

3. **Complete first task:**
   ```typescript
   await processReferralPayout(user2_id)
   ```

4. **Check referrer account:**
   - Login as `user1@example.com`
   - Balance should increase by $1
   - Points should increase by 10

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Users can only read/update their own profiles
- Admins have full access to all profiles and referrals
- Service role is required for signup operations
- Passwords are handled securely by Supabase Auth

## Next Steps

- Implement task completion functionality
- Add referral history page
- Create admin panel for managing users
- Add email verification flow
- Implement password reset

