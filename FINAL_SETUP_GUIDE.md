# Vantra - Final Setup Guide

## 🎉 Complete Features

### User Features
1. **Authentication**
   - Signup with username, email, password, and optional referral code
   - Login with role-based redirects (user → dashboard, admin → admin panel)
   - $2 + 20 points welcome bonus

2. **Dashboard** (`/dashboard`)
   - USDT balance and points display
   - Daily check-in button (24hr cooldown, $0.50 + 5 points reward)
   - Referral stats card
   - Wallet address warning banner
   - Notification bell with dropdown

3. **Tasks** (`/tasks`)
   - Ad tasks: instant completion
   - Social tasks: 5-minute verification timer
   - Rewards credited automatically
   - First task triggers referral payout

4. **Referrals** (`/referrals`)
   - Your referral link with copy button
   - List of referrals with status (Pending/Paid)
   - Stats: Total earned, paid count, pending count

5. **Withdrawal** (`/withdrawal`)
   - Next withdrawal date with live countdown
   - Winner status if in top 5
   - Balance and eligibility status

6. **Settings** (`/settings`)
   - USDT wallet address management
   - Save and validation

7. **Profile** (`/profile`)
   - Account information
   - Stats display
   - Logout button

8. **Leaderboard** (`/leaderboard`)
   - Top 10 users by points
   - Auto-refresh every 30 seconds
   - Gold/silver/bronze styling

9. **Notifications**
   - Bell icon on dashboard
   - Dropdown with unread count
   - Mark as read functionality
   - Real-time updates

### Admin Features (`/admin`)
1. **Task Management** (`/admin/tasks`)
   - Create, edit, delete tasks
   - Set task type (ad/social)
   - Set rewards
   - Ad network slot for embed codes

2. **Withdrawal Management** (`/admin/withdrawals`)
   - View all winners
   - See wallet addresses
   - Mark payouts as complete
   - Deduct balance automatically

3. **Round Management** (`/admin/rounds`)
   - Create new withdrawal rounds
   - Select top 5 winners
   - Start new round (resets all points)

4. **User Management** (`/admin/users`)
   - View all users
   - Search by email, username, referral code
   - See balances, points, referral counts

5. **Notifications** (`/admin/notifications`)
   - Send to specific user or all users
   - Title and message fields
   - Instant delivery

## 📝 SQL Scripts to Run

Run these in Supabase SQL Editor **in order**:

### 1. Core Tables (if not already run)
```bash
# Run these if you haven't already:
- RUN_THIS_SQL.sql (profiles, referrals, basic setup)
- 003_tasks_system.sql (tasks and completions)
```

### 2. Withdrawal System
```bash
WITHDRAWAL_SYSTEM_SQL.sql
or
FIX_WITHDRAWAL_SYSTEM.sql (if tables already exist)
```

### 3. Notifications System
```bash
NOTIFICATIONS_SYSTEM_SQL.sql
```

### 4. Fix All RLS Policies
```bash
COMPLETE_RLS_FIX.sql
```

This is the most important! It ensures:
- Users can see their own data
- Users can see public leaderboard data
- Admin can manage everything
- Notifications work properly

## 🔧 Testing Checklist

### As Regular User:
- [ ] Sign up with referral code
- [ ] Check dashboard shows correct balance ($2)
- [ ] Daily check-in works
- [ ] Complete an ad task (instant)
- [ ] Complete a social task (5 min timer)
- [ ] View referrals page
- [ ] View leaderboard
- [ ] Set wallet address in settings
- [ ] View withdrawal page
- [ ] Check notifications bell
- [ ] Mark notification as read

### As Admin:
- [ ] Access `/admin` (should redirect from /dashboard)
- [ ] Create a new task
- [ ] Edit/delete tasks
- [ ] View users table
- [ ] Search for users
- [ ] Create withdrawal round
- [ ] Select winners for round
- [ ] View withdrawals page
- [ ] Mark payout as complete
- [ ] Send notification to all users
- [ ] Send notification to specific user
- [ ] Start new round (resets points)

## 🚨 Common Issues

### "Database error saving new user"
**Solution**: Run `DROP_AUTH_TRIGGER.sql` to remove conflicting auth triggers

### "infinite recursion detected in policy"
**Solution**: Run `COMPLETE_RLS_FIX.sql` to fix recursive admin policies

### "permission denied for table X"
**Solution**: Run `COMPLETE_RLS_FIX.sql` which includes all GRANT statements

### Can't see other users' data on leaderboard
**Solution**: Run `COMPLETE_RLS_FIX.sql` which adds `profiles_select_public` policy

### Notifications not showing
**Solution**: 
1. Run `NOTIFICATIONS_SYSTEM_SQL.sql`
2. Run `COMPLETE_RLS_FIX.sql`
3. Check browser console for errors

## 📱 Mobile Responsiveness

The bottom navigation is already mobile-responsive:
- 5 nav items on mobile
- Fixed to bottom
- Icons + labels
- Active state indicators

All pages are mobile-responsive using:
- Tailwind's responsive classes (sm:, lg:, etc.)
- Card-based layouts
- Flexible grids
- Scrollable tables

## 🎨 Bottom Navigation Items

1. **Home** - Dashboard
2. **Tasks** - Available tasks
3. **Referrals** - Your referrals
4. **Withdraw** - Withdrawal info
5. **Settings** - Wallet address & settings

## 🔐 Security Notes

- All passwords are hashed by Supabase Auth
- Row Level Security (RLS) enabled on all tables
- Admin role checks in both database and app
- Wallet addresses only visible to admins during payout
- No sensitive data in client-side code

## 🎯 Next Steps

1. Run all SQL scripts in order
2. Test as both user and admin
3. Deploy to Vercel
4. Set up email confirmation in Supabase (optional)
5. Configure MCP or other integrations as needed

## 💡 Tips

- First user should be made admin manually in Supabase
- Withdrawal winners must be selected manually by admin
- Points reset to 0 when "Start New Round" is clicked
- Notifications are sent individually (not broadcast table)
- Leaderboard updates every 30 seconds automatically

---

**That's it! Your Vantra earning platform is complete and ready to use!** 🚀
