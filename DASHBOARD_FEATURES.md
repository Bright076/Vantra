# Dashboard Features Documentation

## Overview

The main user dashboard provides a comprehensive view of the user's account status, including balance, points, referral statistics, and daily check-in functionality.

## Features

### 1. USDT Balance Display

**Location:** Top-left card (large, prominent)

- Displays user's current USDT balance
- Large, eye-catching design with gradient background
- Shows balance to 2 decimal places (e.g., $2.50)
- Icon indicator (dollar sign)
- Subtitle: "Available for withdrawal or tasks"

**Visual Design:**
- Gradient background (indigo to purple)
- 5xl font size for the balance
- Prominent positioning as the primary metric

### 2. Points Display

**Location:** Below USDT balance card

- Shows current points for "This Round"
- Trophy icon indicator
- Description: "Earn points to unlock rewards"
- Large 4xl font for point value
- Badge label "Points"

**Purpose:**
- Points are earned through various activities
- Used for leaderboard rankings
- Can unlock special rewards

### 3. Referral System

**Location:** Right sidebar card

**Components:**
- **Referral Code:** 8-character alphanumeric code
- **Referral Link:** Full URL with copy-to-clipboard functionality
- **Referral Count:** Badge showing total number of referrals
- **Copy Button:** One-click copy with visual feedback

**Features:**
- ✅ Copy referral link with one click
- ✅ Visual confirmation when copied ("Copied!" message)
- ✅ Real-time referral count
- ✅ Helpful tip about earning rewards
- ✅ Responsive design

**Rewards:**
- Earn $1 + 10 points when referrals complete their first task

### 4. Daily Check-in System

**Location:** Dedicated card below points

**Functionality:**

#### When User Can Check In:
- Button is enabled and green
- Text: "Daily Check-in (+$0.50, +5 pts)"
- Gift icon displayed
- Clickable and ready to use

#### When Clicked:
1. Button shows loading state with spinning clock icon
2. Server processes the check-in
3. Adds $0.50 to USDT balance
4. Adds 5 points
5. Updates `last_checkin_at` timestamp
6. Shows success message
7. Page refreshes to show new balance/points

#### When Check-in Not Available:
- Button is disabled (grayed out)
- Shows countdown timer
- Format: "Next check-in in Xh Xm"
- Updates every minute automatically
- Clock icon displayed

#### Success Message:
- Green success banner
- Text: "Check-in successful! You earned $0.50 and 5 points."
- Check icon displayed
- Auto-dismisses after a few seconds

**Business Logic:**
```typescript
- Check-in available if: no previous check-in OR 24 hours have passed
- Reward: $0.50 + 5 points
- Cooldown: 24 hours from last check-in
- Updates last_checkin_at field in database
```

### 5. Quick Stats Card

**Location:** Right sidebar, below referral card

**Displays:**
- Total Earned: Current USDT balance
- Total Points: Current point count
- Referrals: Number of successful referrals
- Account Status: "Active" badge

**Purpose:**
- Quick overview of key metrics
- Easy-to-scan format
- Shows account health at a glance

## UI/UX Design

### Color Scheme
- **Primary:** Indigo/Purple gradients
- **Success:** Green (check-in, success messages)
- **Warning:** Yellow (info messages)
- **Error:** Red (error states)

### Components Used (shadcn/ui)
- `Card` - Container for all sections
- `Button` - Actions (check-in, copy, logout)
- `Badge` - Status indicators, counts
- `Icons` (lucide-react):
  - `DollarSign` - USDT balance
  - `Trophy` - Points
  - `Gift` - Daily check-in
  - `Users` - Referral count
  - `Copy` - Copy button
  - `Check` - Success state
  - `Clock` - Countdown timer
  - `LogOut` - Sign out
  - `TrendingUp` - Growth indicator

### Responsive Layout
- **Desktop (lg+):** 3-column grid
  - Left: 2 columns (balance, points, check-in)
  - Right: 1 column (referral, quick stats)
- **Tablet/Mobile:** Stacked single column
- All cards adapt to available width

### Dark Mode Support
- Full dark mode compatibility
- Automatic theme switching
- Optimized contrast ratios
- All components support both themes

## Database Schema Changes

### Profiles Table Update

New field added:
```sql
last_checkin_at TIMESTAMPTZ
```

**Purpose:**
- Tracks timestamp of user's last daily check-in
- Used to calculate 24-hour cooldown
- NULL value means never checked in

**Migration Files:**
- `001_initial_schema.sql` - Includes field in initial setup
- `002_add_last_checkin.sql` - For existing databases

## Server Actions

### `processDailyCheckin()`

**File:** `lib/actions/daily-checkin.ts`

**Flow:**
1. Authenticate user
2. Fetch current profile (balance, points, last_checkin_at)
3. Check if 24 hours have passed since last check-in
4. If eligible:
   - Add $0.50 to balance
   - Add 5 points
   - Update last_checkin_at to current time
   - Revalidate dashboard cache
5. Return success/error result

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

### `getNextCheckinTime()`

**Purpose:** Helper to check check-in eligibility

**Returns:**
```typescript
{
  canCheckin: boolean
  nextCheckinAt: string | null
  hoursRemaining: number | null
}
```

## Client Components

### `DailyCheckinButton`

**File:** `components/daily-checkin-button.tsx`

**Features:**
- Real-time countdown timer
- Automatic state updates every minute
- Loading state during processing
- Success/error message display
- Disabled state when not eligible

**Props:**
```typescript
{
  lastCheckinAt: string | null
}
```

### `ReferralStatsCard`

**File:** `components/referral-stats-card.tsx`

**Features:**
- Copy referral link functionality
- Visual feedback on copy
- Referral count badge
- Helpful tips and instructions

**Props:**
```typescript
{
  referralCode: string
  referralCount: number
}
```

### `LogoutButton`

**File:** `components/logout-button.tsx`

**Features:**
- Sign out functionality
- Supabase auth integration
- Redirect to login page
- Icon + text button

## Testing Checklist

### Daily Check-in
- [ ] First-time users can check in immediately
- [ ] After check-in, balance increases by $0.50
- [ ] After check-in, points increase by 5
- [ ] Button becomes disabled after check-in
- [ ] Countdown shows correct time remaining
- [ ] Button re-enables after 24 hours
- [ ] Multiple check-ins give correct rewards
- [ ] Success message appears
- [ ] Page refreshes to show new values

### Referral System
- [ ] Referral code displays correctly
- [ ] Referral link is properly formatted
- [ ] Copy button copies full URL
- [ ] "Copied!" feedback appears
- [ ] Referral count is accurate
- [ ] Referral count updates when new referrals sign up

### Display & Layout
- [ ] USDT balance displays prominently
- [ ] Points display correctly
- [ ] All cards render properly
- [ ] Responsive design works on mobile
- [ ] Dark mode works correctly
- [ ] Icons display properly
- [ ] Quick stats show correct values

### Navigation & Auth
- [ ] Logout button works
- [ ] Redirects to login after logout
- [ ] Dashboard requires authentication
- [ ] Admin users redirect to /admin

## API Endpoints

No direct API endpoints - uses server actions:
- `processDailyCheckin()` - POST action via form
- `getNextCheckinTime()` - Server-side helper

## Error Handling

### Check-in Errors
- Not authenticated → "Not authenticated"
- Profile fetch fails → "Failed to fetch profile"
- Too soon → "Check-in not available yet"
- Database update fails → "Failed to process check-in"
- Unknown error → "An error occurred during check-in"

### Display Fallbacks
- Missing referral count → Shows 0
- Never checked in → Button enabled immediately
- Network error → Shows error message

## Performance Optimizations

- Server-side data fetching
- Revalidation only when necessary
- Countdown updates at 1-minute intervals (not every second)
- Copy action is client-side (no server round-trip)
- Lazy loading of non-critical components

## Security

- Server actions validate authentication
- Database queries use RLS policies
- User can only update their own profile
- Check-in validation prevents abuse
- Rate limiting via 24-hour cooldown

## Future Enhancements

Potential additions:
- [ ] Check-in streak counter
- [ ] Bonus rewards for consecutive days
- [ ] Referral leaderboard
- [ ] Point redemption system
- [ ] Task completion history
- [ ] Earnings chart/graph
- [ ] Notification center
- [ ] Achievement badges

## Troubleshooting

### Check-in button stuck disabled
- Clear browser cache
- Check database value for `last_checkin_at`
- Verify system time is correct
- Check server logs for errors

### Referral count incorrect
- Verify `referrals` table data
- Check RLS policies
- Refresh page
- Check Supabase logs

### Balance not updating
- Verify check-in was successful
- Check database value manually
- Ensure revalidation is working
- Check for database connection issues

---

**Last Updated:** Dashboard v2.0 with shadcn/ui components
**Dependencies:** Supabase, Next.js 15+, shadcn/ui, lucide-react
