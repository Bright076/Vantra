# Changelog

All notable changes to the Vantra platform will be documented in this file.

## [2.0.0] - 2026-09-10

### Added - Dashboard Redesign with shadcn/ui

#### New Features
- **Daily Check-in System**
  - Users can check in once every 24 hours
  - Rewards: $0.50 + 5 points per check-in
  - Real-time countdown timer showing time until next check-in
  - Visual feedback with success messages
  - Automatic page refresh after check-in

- **Modern Dashboard UI**
  - Complete redesign using shadcn/ui components
  - Card-based layout for better organization
  - Gradient backgrounds for visual appeal
  - Prominent USDT balance display (5xl font)
  - Points card with trophy icon
  - Quick stats overview card
  - Full dark mode support

- **Enhanced Referral Display**
  - New referral stats card component
  - Copy-to-clipboard with visual feedback
  - Referral count badge
  - Improved information hierarchy
  - Helpful tips and instructions

#### New Components
- `components/ui/button.tsx` - shadcn/ui Button component
- `components/ui/card.tsx` - shadcn/ui Card component
- `components/ui/badge.tsx` - shadcn/ui Badge component
- `components/daily-checkin-button.tsx` - Daily check-in functionality
- `components/referral-stats-card.tsx` - Referral statistics display
- `lib/utils.ts` - Utility functions (cn helper)

#### New Server Actions
- `lib/actions/daily-checkin.ts`
  - `processDailyCheckin()` - Process daily check-in
  - `getNextCheckinTime()` - Get check-in eligibility status

#### Database Changes
- Added `last_checkin_at` field to profiles table
- Migration file: `002_add_last_checkin.sql`

#### Dependencies
- `class-variance-authority` - For component variants
- `clsx` - For className management
- `tailwind-merge` - For Tailwind class merging
- `lucide-react` - Icon library

#### Documentation
- `DASHBOARD_FEATURES.md` - Complete feature breakdown
- `DASHBOARD_SETUP.md` - Setup guide for new dashboard
- `DASHBOARD_PREVIEW.md` - Visual preview and layout guide
- `CHANGELOG.md` - This file

#### Improvements
- Updated logout button to use shadcn/ui Button
- Improved responsive design for mobile devices
- Better visual hierarchy with card-based layout
- Enhanced accessibility with proper ARIA labels
- Smoother animations and transitions

---

## [1.0.0] - 2026-09-10

### Added - Initial Release

#### Authentication System
- Email/password authentication with Supabase
- User registration at `/signup`
- User login at `/login`
- Automatic session management
- Secure cookie-based sessions

#### Referral System
- Unique 8-character referral code generation
- Referral tracking via `?ref=CODE` URL parameter
- $2 + 20 points welcome bonus for all new users
- $1 + 10 points referral reward (paid on first task completion)
- Pending referral status until task completion
- `processReferralPayout()` function for task integration

#### Role-Based Access Control
- User and admin roles
- Protected route wrapper component
- Automatic redirects based on role:
  - Unauthenticated → `/login`
  - Admin users → `/admin`
  - Regular users → `/dashboard`

#### User Interface
- Basic dashboard with balance and points
- Simple referral link display
- Dark mode support
- Responsive design with Tailwind CSS

#### Database Schema
- `profiles` table with balance, points, referral_code
- `referrals` table with status tracking
- Row Level Security (RLS) policies
- Proper indexes and constraints

#### Core Components
- `app/signup/page.tsx` - Registration page
- `app/login/page.tsx` - Login page
- `app/dashboard/page.tsx` - User dashboard
- `app/admin/page.tsx` - Admin dashboard
- `lib/auth/protected-route.tsx` - Route protection
- `lib/actions/referral-payout.ts` - Referral processing
- `lib/utils/referral.ts` - Referral code generation

#### Middleware
- `middleware.ts` - Session management
- `lib/supabase/middleware.ts` - Supabase integration
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client

#### Documentation
- `README.md` - Project overview
- `QUICK_START.md` - Setup guide
- `AUTH_SETUP.md` - Authentication details
- `SETUP_CHECKLIST.md` - Setup checklist
- `IMPLEMENTATION_SUMMARY.md` - Technical overview
- `FLOW_DIAGRAM.md` - System flow diagrams

#### Database Migrations
- `001_initial_schema.sql` - Complete initial schema

#### Configuration
- `.env.local.example` - Environment variables template
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration

---

## Version History Summary

- **v2.0.0** - Dashboard redesign with daily check-in, shadcn/ui components
- **v1.0.0** - Initial release with auth, referrals, basic dashboard

---

## Upcoming Features

### Planned for v2.1.0
- [ ] Task creation and management system
- [ ] Task completion functionality
- [ ] Integration of referral payout on first task
- [ ] Task history page

### Planned for v2.2.0
- [ ] Withdrawal system
- [ ] Payment integration
- [ ] Transaction history

### Planned for v2.3.0
- [ ] Admin panel enhancements
- [ ] User management for admins
- [ ] Referral analytics
- [ ] Platform statistics

### Planned for v3.0.0
- [ ] Leaderboard system
- [ ] Achievement badges
- [ ] Check-in streak tracking
- [ ] Bonus rewards for consecutive check-ins
- [ ] Email notifications
- [ ] Push notifications

---

## Breaking Changes

### v2.0.0
- Dashboard layout completely redesigned (visual changes only)
- New database field `last_checkin_at` required (run migration 002)
- New dependencies required (shadcn/ui related)

### v1.0.0
- Initial release, no breaking changes

---

## Migration Guide

### From v1.0.0 to v2.0.0

1. **Update dependencies:**
   ```bash
   bun add class-variance-authority clsx tailwind-merge lucide-react
   ```

2. **Run database migration:**
   - Execute `supabase/migrations/002_add_last_checkin.sql`
   - Or add field manually:
     ```sql
     ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_checkin_at TIMESTAMPTZ;
     ```

3. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   bun run dev
   ```

4. **No code changes required** - All changes are backward compatible

---

## Contributors

- Initial development and v1.0.0 implementation
- Dashboard redesign and v2.0.0 features
- Documentation and setup guides

---

## Notes

- All dates in format: YYYY-MM-DD
- Version numbering follows Semantic Versioning (SemVer)
- Major version (X.0.0) - Breaking changes
- Minor version (0.X.0) - New features, backward compatible
- Patch version (0.0.X) - Bug fixes, backward compatible
