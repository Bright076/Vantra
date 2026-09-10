# Setup Checklist

Follow this checklist to get your authentication and referral system up and running.

## Prerequisites
- [ ] Bun installed (or Node.js 20+)
- [ ] Supabase account created (https://supabase.com)

## Step 1: Supabase Project Setup
- [ ] Create a new Supabase project
- [ ] Wait for project initialization (2-3 minutes)
- [ ] Navigate to SQL Editor
- [ ] Copy contents of `supabase/migrations/001_initial_schema.sql`
- [ ] Paste into SQL Editor and run
- [ ] Verify "Success. No rows returned" message

## Step 2: Get Supabase Credentials
- [ ] Go to Project Settings > API
- [ ] Copy Project URL (looks like: `https://xxxxx.supabase.co`)
- [ ] Copy anon/public key (starts with `eyJhbGc...`)

## Step 3: Configure Environment
- [ ] Run: `cp .env.local.example .env.local`
- [ ] Open `.env.local`
- [ ] Paste your Supabase URL
- [ ] Paste your anon key
- [ ] Save the file

## Step 4: Install & Run
- [ ] Run: `bun install` (if not already done)
- [ ] Run: `bun run dev`
- [ ] Open http://localhost:3000
- [ ] Verify you're redirected to `/login`

## Step 5: Test Signup
- [ ] Navigate to http://localhost:3000/signup
- [ ] Create a test account (e.g., `test@example.com`)
- [ ] Password should be at least 6 characters
- [ ] Check for success message
- [ ] Verify redirect to `/login`

## Step 6: Test Login
- [ ] Login with test credentials
- [ ] Verify redirect to `/dashboard`
- [ ] Check balance shows $2.00
- [ ] Check points show 20
- [ ] Verify referral code is displayed (8 characters)

## Step 7: Test Referral Flow
- [ ] Copy your referral code from dashboard
- [ ] Logout using "Sign Out" button
- [ ] Open: http://localhost:3000/signup?ref=YOUR_CODE
- [ ] Verify green banner shows referral message
- [ ] Create second test account
- [ ] Login with second account
- [ ] Verify balance is $2.00 and points are 20

## Step 8: Verify Referral in Database
- [ ] Go to Supabase Dashboard > Table Editor
- [ ] Open `referrals` table
- [ ] Verify one row exists
- [ ] Check `status` is 'pending'
- [ ] Check `referrer_id` and `referred_id` are set correctly

## Step 9: Test Admin Access
- [ ] Go to Supabase Dashboard > Table Editor > profiles
- [ ] Find your first user
- [ ] Edit `role` field from 'user' to 'admin'
- [ ] Login as that user
- [ ] Verify redirect to `/admin`
- [ ] Try accessing `/dashboard` - should redirect back to `/admin`
- [ ] Logout and login as regular user
- [ ] Try accessing `/admin` - should redirect to `/dashboard`

## Step 10: Test Referral Payout (After Task System)
This step will be completed after implementing the task system:
- [ ] Implement task completion functionality
- [ ] Integrate `processReferralPayout()` function
- [ ] Have second user complete first task
- [ ] Login as first user (referrer)
- [ ] Verify balance increased by $1
- [ ] Verify points increased by 10
- [ ] Check referral status changed to 'paid' in database

## Optional: Email Verification
- [ ] Go to Supabase Dashboard > Authentication > Settings
- [ ] Configure SMTP settings (or use Supabase's built-in)
- [ ] Enable "Confirm email" option
- [ ] Test signup - should require email confirmation
- [ ] Check email for confirmation link

## Troubleshooting

### Can't connect to Supabase
- [ ] Verify `.env.local` exists
- [ ] Check credentials are correct
- [ ] Restart dev server after changing `.env.local`
- [ ] Check Supabase project is active (not paused)

### Signup not working
- [ ] Check browser console for errors
- [ ] Verify migration ran successfully
- [ ] Check Supabase logs in Dashboard > Logs
- [ ] Verify email format is valid

### Redirects not working
- [ ] Clear browser cookies
- [ ] Check middleware is running
- [ ] Verify RLS policies are enabled
- [ ] Check user role in profiles table

### Referral not tracked
- [ ] Verify URL has `?ref=CODE` parameter
- [ ] Check referral code exists in profiles table
- [ ] Check browser console for errors
- [ ] Verify referrals table has correct permissions

## Success Criteria
✅ Users can sign up and receive $2 + 20 points  
✅ Users can login and see their dashboard  
✅ Referral codes are generated automatically  
✅ Referral links work with `?ref=CODE`  
✅ Pending referrals are created in database  
✅ Admin users redirect to `/admin`  
✅ Regular users redirect to `/dashboard`  
✅ Protected routes work correctly  
✅ Logout functionality works  

## Next Steps
Once all checkboxes are complete:
1. ✅ Authentication system is ready
2. ✅ Referral system is ready
3. ⏳ Proceed to implement task system (Prompt 4)
4. ⏳ Integrate referral payout on first task completion

---

**Need Help?**
- See QUICK_START.md for detailed instructions
- See AUTH_SETUP.md for authentication details
- Check Supabase docs: https://supabase.com/docs
- Check Next.js docs: https://nextjs.org/docs
