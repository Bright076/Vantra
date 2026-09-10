# Dashboard Setup Guide

## Quick Setup for Daily Check-in Feature

If you've already set up the authentication system and need to add the daily check-in feature:

### Step 1: Update Database

**Option A: For New Installations**
- Run the updated `supabase/migrations/001_initial_schema.sql` (already includes `last_checkin_at` field)

**Option B: For Existing Installations**
1. Go to Supabase Dashboard > SQL Editor
2. Run this migration:
   ```sql
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_checkin_at TIMESTAMPTZ;
   ```
   Or use the provided file: `supabase/migrations/002_add_last_checkin.sql`

### Step 2: Install Dependencies

Already installed:
```bash
bun add class-variance-authority clsx tailwind-merge lucide-react
```

### Step 3: Verify Files

The following files have been created/updated:

**New shadcn/ui Components:**
- ✅ `components/ui/button.tsx`
- ✅ `components/ui/card.tsx`
- ✅ `components/ui/badge.tsx`

**New Feature Components:**
- ✅ `components/daily-checkin-button.tsx`
- ✅ `components/referral-stats-card.tsx`
- ✅ `lib/utils.ts` (cn utility)

**Updated Components:**
- ✅ `components/logout-button.tsx` (now uses shadcn Button)

**Server Actions:**
- ✅ `lib/actions/daily-checkin.ts`

**Updated Pages:**
- ✅ `app/dashboard/page.tsx` (completely redesigned)

**Updated Types:**
- ✅ `lib/types/database.ts` (added `last_checkin_at` field)

### Step 4: Test the Dashboard

1. **Start the dev server:**
   ```bash
   bun run dev
   ```

2. **Login to your account**
   - Navigate to http://localhost:3000/login
   - Login with your test account

3. **Test the dashboard:**
   - Should see new card-based layout
   - USDT balance prominently displayed
   - Points card visible
   - Daily check-in button ready

4. **Test daily check-in:**
   - Click "Daily Check-in" button
   - Should see success message
   - Balance should increase by $0.50
   - Points should increase by 5
   - Button should disable and show countdown

5. **Test referral features:**
   - Referral code should display
   - Copy button should work
   - Referral count should show

## Component Structure

```
Dashboard Page
├── Header (Title + Logout Button)
├── Main Content (3-column grid)
│   ├── Left Column (2 columns wide)
│   │   ├── USDT Balance Card (prominent)
│   │   ├── Points Card
│   │   └── Daily Check-in Card
│   └── Right Column (1 column wide)
│       ├── Referral Stats Card
│       └── Quick Stats Card
```

## Styling

The dashboard uses:
- **Tailwind CSS** for styling
- **shadcn/ui** components for consistency
- **lucide-react** for icons
- Gradient backgrounds for visual appeal
- Full dark mode support

## Features at a Glance

### 1. USDT Balance Card
- Large, prominent display
- Gradient background (indigo/purple)
- Dollar sign icon
- "Available for withdrawal" subtitle

### 2. Points Card
- Trophy icon
- Clear point value
- "This Round" label
- Badge indicator

### 3. Daily Check-in Card
- Gift icon
- Reward info: +$0.50, +5 pts
- Countdown when on cooldown
- Success feedback
- 24-hour cooldown

### 4. Referral Stats Card
- Referral code display
- Copy-to-clipboard link
- Referral count badge
- Helpful tips

### 5. Quick Stats Card
- Total earned
- Total points
- Referral count
- Account status

## Customization

### Change Check-in Rewards

Edit `lib/actions/daily-checkin.ts`:
```typescript
// Change these values:
const newBalance = profile.balance + 0.5  // Change 0.5 to desired amount
const newPoints = profile.points + 5      // Change 5 to desired points
```

### Change Cooldown Period

Edit `lib/actions/daily-checkin.ts`:
```typescript
// Change 24 hours to desired duration:
const hoursSinceLastCheckin = (now.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60)
if (hoursSinceLastCheckin < 24) { // Change 24 to desired hours
```

### Customize Colors

The dashboard uses Tailwind utility classes. Main colors:
- **Primary:** `indigo-*` and `purple-*`
- **Success:** `green-*`
- **Warning:** `yellow-*`
- **Neutral:** `gray-*`

To change theme colors, edit the classes in:
- `app/dashboard/page.tsx`
- `components/daily-checkin-button.tsx`
- `components/referral-stats-card.tsx`

## Troubleshooting

### Dashboard not showing new design
- Clear Next.js cache: `rm -rf .next`
- Restart dev server
- Hard refresh browser (Ctrl+Shift+R)

### Check-in button not working
- Verify database migration ran successfully
- Check `last_checkin_at` field exists in profiles table
- Check browser console for errors
- Verify server action is being called

### Icons not displaying
- Verify lucide-react is installed: `bun add lucide-react`
- Check imports in components
- Clear cache and restart

### Styling issues
- Verify Tailwind is configured correctly
- Check `globals.css` is imported
- Ensure `cn` utility is working
- Check for CSS conflicts

## Database Schema

The `profiles` table should now include:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'user',
  balance DECIMAL(10, 2) DEFAULT 0.00,
  points INTEGER DEFAULT 0,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by UUID,
  last_checkin_at TIMESTAMPTZ,          -- NEW FIELD
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Reference

### Server Actions

#### `processDailyCheckin()`
**File:** `lib/actions/daily-checkin.ts`

Processes daily check-in for authenticated user.

**Returns:**
```typescript
{
  success: boolean
  message: string
  newBalance?: number
  newPoints?: number
  nextCheckinAt?: string
}
```

#### `getNextCheckinTime()`
**File:** `lib/actions/daily-checkin.ts`

Gets check-in eligibility status.

**Returns:**
```typescript
{
  canCheckin: boolean
  nextCheckinAt: string | null
  hoursRemaining: number | null
}
```

## Next Steps

After setting up the dashboard:

1. ✅ Dashboard is now complete
2. ⏳ Implement task system (next prompt)
3. ⏳ Add withdrawal functionality
4. ⏳ Create admin panel features
5. ⏳ Add analytics and charts

## Support

For detailed feature documentation, see:
- **DASHBOARD_FEATURES.md** - Complete feature breakdown
- **AUTH_SETUP.md** - Authentication system
- **QUICK_START.md** - Initial setup

---

**Status:** ✅ Dashboard v2.0 Complete
**Last Updated:** Implementation with shadcn/ui components
