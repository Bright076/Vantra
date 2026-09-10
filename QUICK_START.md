# Quick Start Guide

## Prerequisites

- Node.js 20+ or Bun installed
- A Supabase account (free tier works fine)

## Setup Steps

### 1. Install Dependencies

Already done! But if you need to reinstall:
```bash
bun install
```

### 2. Set Up Supabase

1. **Create a Supabase project:**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Choose a name and password
   - Wait for setup to complete (~2 minutes)

2. **Run the database migration:**
   - In Supabase dashboard, go to SQL Editor
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste into the SQL Editor and click "Run"
   - You should see "Success. No rows returned"

3. **Get your API credentials:**
   - Go to Project Settings > API
   - Copy the Project URL
   - Copy the `anon/public` key

### 3. Configure Environment Variables

1. Create `.env.local` file in the project root:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 4. Run the Application

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Test the Auth Flow

### Test Signup

1. Navigate to http://localhost:3000/signup
2. Create a test user (e.g., `test@example.com`)
3. Check that:
   - User is created
   - User is redirected to `/login`
   - Confirmation email is sent (if you configured SMTP in Supabase)

4. Login with the test user at http://localhost:3000/login
5. Check that you land on `/dashboard` with:
   - Balance: $2.00 (welcome bonus)
   - Points: 20 (welcome bonus)
   - A unique 8-character referral code

### Test Referrals

1. **Get referral code:**
   - Login as first user
   - Copy the referral code from dashboard (e.g., `ABCD1234`)

2. **Sign up with referral:**
   - Open http://localhost:3000/signup?ref=ABCD1234
   - Create a second user (e.g., `user2@example.com`)
   - Check welcome message mentions referral bonus

3. **Verify in database:**
   - Go to Supabase dashboard > Table Editor
   - Check `referrals` table - should have one row with `status='pending'`
   - Check second user's `profiles` row - `referred_by` should be set to first user's ID

4. **Simulate first task completion:**
   - When you implement task completion, call:
     ```typescript
     import { processReferralPayout } from '@/lib/actions/referral-payout'
     await processReferralPayout(secondUserId)
     ```
   - This will:
     - Credit first user with $1 + 10 points
     - Set referral status to 'paid'
     - Set paid_at timestamp

### Test Admin Access

1. **Make a user admin:**
   - Go to Supabase dashboard > Table Editor > profiles
   - Find your user
   - Edit the `role` field from `user` to `admin`

2. **Test admin redirect:**
   - Login as the admin user
   - Should redirect to `/admin` instead of `/dashboard`
   - Try accessing `/dashboard` - should redirect back to `/admin`

3. **Test user protection:**
   - Login as a regular user
   - Try accessing `/admin` directly
   - Should redirect to `/dashboard`

## Available Routes

| Route | Access | Redirect Logic |
|-------|--------|----------------|
| `/signup` | Public | - |
| `/signup?ref=CODE` | Public | Tracks referral |
| `/login` | Public | Redirects based on role |
| `/dashboard` | User only | Admins → `/admin` |
| `/admin` | Admin only | Users → `/dashboard` |

## Key Files

### Authentication
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client
- `lib/supabase/middleware.ts` - Session management
- `middleware.ts` - Next.js middleware

### Pages
- `app/signup/page.tsx` - Registration with referral
- `app/login/page.tsx` - Login with role redirect
- `app/dashboard/page.tsx` - User dashboard
- `app/admin/page.tsx` - Admin dashboard

### Auth Logic
- `lib/auth/protected-route.tsx` - Route protection wrapper
- `lib/auth/get-user.ts` - Get current user + profile

### Referral System
- `lib/utils/referral.ts` - Generate referral codes
- `lib/actions/referral-payout.ts` - Process referral rewards

### Database
- `supabase/migrations/001_initial_schema.sql` - Complete schema
- `lib/types/database.ts` - TypeScript types

## Next Steps

1. ✅ Auth system is complete
2. ✅ Referral tracking is set up
3. ⏳ Implement task system (Prompt 4)
4. ⏳ Integrate `processReferralPayout()` into first task completion
5. ⏳ Add email verification flow (optional)
6. ⏳ Add password reset flow (optional)

## Troubleshooting

### "Invalid API Key" error
- Check that `.env.local` exists and has correct values
- Restart dev server after changing `.env.local`

### Users not being created
- Check Supabase logs in Dashboard > Logs
- Verify migration ran successfully
- Check email confirmation settings in Auth > Settings

### Redirects not working
- Clear browser cookies
- Check middleware is running (should see session cookies)
- Verify RLS policies in Supabase

### Referral not being tracked
- Check URL has `?ref=CODE` parameter
- Verify referral code exists in `profiles` table
- Check browser console for errors

## Support

For detailed documentation, see:
- `AUTH_SETUP.md` - Complete authentication guide
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
