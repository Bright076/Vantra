# Vantra - Task Platform with Referral System

A modern task platform built with Next.js 16, Supabase Auth, referral rewards, and daily check-in system.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up Supabase:**
   - Create a Supabase project at https://supabase.com
   - Run the SQL migration from `supabase/migrations/001_initial_schema.sql`
   - Copy your project URL and anon key

3. **Configure environment:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Run the development server:**
   ```bash
   bun run dev
   ```

5. **Open http://localhost:3000**

## 📚 Documentation

### Setup Guides
- **[QUICK_START.md](./QUICK_START.md)** - Complete setup guide
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Step-by-step checklist
- **[AUTH_SETUP.md](./AUTH_SETUP.md)** - Authentication system details

### Feature Documentation
- **[DASHBOARD_FEATURES.md](./DASHBOARD_FEATURES.md)** - Dashboard features breakdown
- **[DASHBOARD_SETUP.md](./DASHBOARD_SETUP.md)** - Dashboard setup guide
- **[DASHBOARD_PREVIEW.md](./DASHBOARD_PREVIEW.md)** - Visual preview
- **[FLOW_DIAGRAM.md](./FLOW_DIAGRAM.md)** - System flow diagrams

### Technical
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical overview

## ✨ Features

### Authentication & Security
- ✅ Email/password authentication with Supabase
- ✅ Role-based access control (user/admin)
- ✅ Protected routes with automatic redirects
- ✅ Secure session management

### Rewards & Incentives
- ✅ $2 + 20 points welcome bonus for all users
- ✅ Daily check-in: $0.50 + 5 points every 24 hours
- ✅ Referral system with unique 8-character codes
- ✅ $1 + 10 points referral rewards (paid on first task completion)

### Dashboard
- ✅ Prominent USDT balance display
- ✅ Points tracking (this round)
- ✅ Daily check-in button with countdown timer
- ✅ Referral link with copy-to-clipboard
- ✅ Referral count tracking
- ✅ Quick stats overview
- ✅ Modern card-based layout with shadcn/ui
- ✅ Full dark mode support
- ✅ Responsive design

## 🎨 UI Components

Built with **shadcn/ui** components:
- Cards, Buttons, Badges
- Icons from **lucide-react**
- Gradient backgrounds
- Smooth animations
- Accessible and keyboard-friendly

## 🔗 Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Home (redirects based on auth) | Auto-redirect |
| `/signup` | User registration | Public |
| `/signup?ref=CODE` | Registration with referral | Public |
| `/login` | User login | Public |
| `/dashboard` | User dashboard with all features | User only |
| `/admin` | Admin dashboard | Admin only |

## 🧪 Testing the Flow

### Authentication
1. Sign up at `/signup`
2. Check dashboard - should have $2 + 20 points
3. Note your referral code

### Daily Check-in
1. Click "Daily Check-in" button
2. Balance increases by $0.50
3. Points increase by 5
4. Button shows countdown for 24 hours
5. Check in again after 24 hours

### Referral System
1. Copy your referral link from dashboard
2. Sign up another user with your referral link
3. New user gets $2 + 20 points (welcome bonus)
4. When new user completes first task, you get $1 + 10 points

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Auth:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **UI Components:** shadcn/ui
- **Icons:** lucide-react
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Package Manager:** Bun

## 📦 Project Structure

```
vantra/
├── app/                    # Next.js app router pages
│   ├── signup/            # Registration page
│   ├── login/             # Login page
│   ├── dashboard/         # User dashboard (main)
│   └── admin/             # Admin dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── daily-checkin-button.tsx
│   ├── referral-stats-card.tsx
│   └── logout-button.tsx
├── lib/                   # Utilities and business logic
│   ├── actions/          # Server actions
│   │   ├── daily-checkin.ts
│   │   └── referral-payout.ts
│   ├── auth/             # Authentication logic
│   ├── supabase/         # Supabase clients
│   ├── types/            # TypeScript types
│   └── utils/            # Helper functions
├── supabase/             # Database migrations
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_add_last_checkin.sql
└── public/               # Static assets
```

## 🎯 Key Features Breakdown

### 1. USDT Balance
- Large, prominent display (5xl font)
- Gradient background (indigo/purple)
- Real-time updates
- Displayed with 2 decimal precision

### 2. Daily Check-in
- Button enabled/disabled based on 24-hour cooldown
- Real-time countdown display (updates every minute)
- Rewards: $0.50 + 5 points
- Success feedback with animation
- Automatic page refresh after check-in

### 3. Referral Program
- Unique 8-character alphanumeric code per user
- Copy-to-clipboard functionality with feedback
- Real-time referral count
- Referral rewards paid on first task completion
- Pending → Paid status tracking

### 4. Points System
- Track points for "this round"
- Earned through:
  - Welcome bonus: 20 points
  - Daily check-in: 5 points
  - Referral rewards: 10 points
- Trophy icon display
- Badge indicator

### 5. Quick Stats
- Total earned (balance)
- Total points
- Referral count
- Account status

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Server-side authentication checks
- Secure session management with cookies
- Protected server actions
- Role-based access control
- Input validation and sanitization

## 💾 Database Schema

### Tables
- **profiles** - User profiles with balance, points, referral code
- **referrals** - Referral tracking (pending/paid)

### Key Fields
- `balance` (DECIMAL) - USDT balance
- `points` (INTEGER) - Current points
- `referral_code` (TEXT) - Unique referral code
- `last_checkin_at` (TIMESTAMPTZ) - Last check-in timestamp
- `referred_by` (UUID) - Referrer user ID

## 🚧 Next Steps

- [ ] Implement task creation and completion system
- [ ] Integrate referral payout on first task completion
- [ ] Add withdrawal functionality
- [ ] Create admin panel features
- [ ] Add referral history page
- [ ] Implement leaderboard
- [ ] Add email verification
- [ ] Implement password reset

## 🐛 Troubleshooting

### Dashboard not showing new design
```bash
rm -rf .next
bun run dev
```

### Check-in button not working
- Verify database migration ran successfully
- Check `last_checkin_at` field exists
- Check browser console for errors

### Balance not updating
- Verify Supabase connection
- Check RLS policies
- Refresh page manually
- Check server logs

## 📞 Support

See documentation files for detailed help:
- Setup issues → [QUICK_START.md](./QUICK_START.md)
- Dashboard issues → [DASHBOARD_SETUP.md](./DASHBOARD_SETUP.md)
- Feature questions → [DASHBOARD_FEATURES.md](./DASHBOARD_FEATURES.md)

## 📄 License

This project is built for the Vantra task platform.

---

**Current Version:** v2.0 (Dashboard with Daily Check-in)  
**Last Updated:** 2026  
**Status:** ✅ Ready for task system integration
