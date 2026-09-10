# Dashboard Visual Preview

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Dashboard                                        Welcome back, user@example │
│                                                              [Sign Out]       │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┐  ┌─────────────────────────────────┐
│ LEFT COLUMN (2/3 width)              │  │ RIGHT COLUMN (1/3 width)        │
│                                      │  │                                 │
│ ╔══════════════════════════════════╗ │  │ ┌─────────────────────────────┐ │
│ ║   USDT BALANCE                   ║ │  │ │ Referral Program        👥 2 │ │
│ ║   💰 $2.50                       ║ │  │ │─────────────────────────────│ │
│ ║   Available for withdrawal       ║ │  │ │ Your Referral Code          │ │
│ ╚══════════════════════════════════╝ │  │ │ ABCD1234                    │ │
│                                      │  │ │                             │ │
│ ┌────────────────────────────────┐   │  │ │ Your Referral Link          │ │
│ │ Points (This Round)      🏆    │   │  │ │ [https://...?ref=ABC] [Copy]│ │
│ │────────────────────────────────│   │  │ │                             │ │
│ │ 20 Points                      │   │  │ │ 💡 Share your link...       │ │
│ │                                │   │  │ └─────────────────────────────┘ │
│ └────────────────────────────────┘   │  │                                 │
│                                      │  │ ┌─────────────────────────────┐ │
│ ┌────────────────────────────────┐   │  │ │ Quick Stats                 │ │
│ │ 🎁 Daily Check-in              │   │  │ │─────────────────────────────│ │
│ │────────────────────────────────│   │  │ │ Total Earned      $2.50     │ │
│ │ Check in daily to earn $0.50   │   │  │ │ Total Points      20 pts    │ │
│ │ and 5 points                   │   │  │ │ Referrals         2         │ │
│ │                                │   │  │ │ Account Status    Active    │ │
│ │ [Daily Check-in (+$0.50, +5)]  │   │  │ └─────────────────────────────┘ │
│ │                                │   │  │                                 │
│ └────────────────────────────────┘   │  └─────────────────────────────────┘
│                                      │
└──────────────────────────────────────┘
```

## Card Designs

### 1. USDT Balance Card (Prominent)

```
╔════════════════════════════════════════════════════╗
║  USDT Balance                               💰     ║
║                                                    ║
║  $2.50                                            ║
║  (Large, 5xl font size)                           ║
║                                                    ║
║  📈 Available for withdrawal or tasks              ║
╚════════════════════════════════════════════════════╝
  Gradient background: Indigo → Purple
  Border: Indigo
```

### 2. Points Card

```
┌────────────────────────────────────────────────────┐
│  Points (This Round)                          🏆   │
│  Earn points to unlock rewards                     │
│─────────────────────────────────────────────────────
│                                                    │
│  20                                                │
│  (4xl font size)                      [Points]     │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 3. Daily Check-in Card

**State A: Ready to Check In**
```
┌────────────────────────────────────────────────────┐
│  🎁 Daily Check-in                                 │
│  Check in daily to earn $0.50 and 5 points         │
│─────────────────────────────────────────────────────
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  🎁  Daily Check-in (+$0.50, +5 pts)         │ │
│  └──────────────────────────────────────────────┘ │
│  (Green button, enabled)                          │
│                                                    │
└────────────────────────────────────────────────────┘
```

**State B: On Cooldown**
```
┌────────────────────────────────────────────────────┐
│  🎁 Daily Check-in                                 │
│  Check in daily to earn $0.50 and 5 points         │
│─────────────────────────────────────────────────────
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  🕐  Next check-in in 23h 45m                │ │
│  └──────────────────────────────────────────────┘ │
│  (Gray button, disabled)                          │
│                                                    │
└────────────────────────────────────────────────────┘
```

**State C: Processing**
```
┌────────────────────────────────────────────────────┐
│  🎁 Daily Check-in                                 │
│  Check in daily to earn $0.50 and 5 points         │
│─────────────────────────────────────────────────────
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  ⏳  Processing...                           │ │
│  └──────────────────────────────────────────────┘ │
│  (Button shows spinner)                           │
│                                                    │
└────────────────────────────────────────────────────┘
```

**State D: Success**
```
┌────────────────────────────────────────────────────┐
│  🎁 Daily Check-in                                 │
│  Check in daily to earn $0.50 and 5 points         │
│─────────────────────────────────────────────────────
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  🕐  Next check-in in 24h 0m                 │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ ✅ Check-in successful! You earned $0.50     │ │
│  │    and 5 points.                              │ │
│  └──────────────────────────────────────────────┘ │
│  (Green success banner)                           │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 4. Referral Program Card

```
┌────────────────────────────────────────────────────┐
│  Referral Program                         👥 2     │
│  Earn $1 + 10 points when your referrals complete  │
│  their first task                                  │
│─────────────────────────────────────────────────────
│                                                    │
│  Your Referral Code                                │
│  ABCD1234                                          │
│  (Large, mono font, indigo color)                  │
│                                                    │
│  Your Referral Link                                │
│  ┌──────────────────────────────────────────────┐ │
│  │ https://yourdomain.com/signup?ref=ABCD1234   │ │
│  └──────────────────────────────────────────────┘ │
│                                          [Copy ✂️] │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ 💡 Share your link to invite friends. You'll │ │
│  │    earn rewards when they complete their     │ │
│  │    first task!                                │ │
│  └──────────────────────────────────────────────┘ │
│  (Indigo info banner)                             │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 5. Quick Stats Card

```
┌────────────────────────────────────────────────────┐
│  Quick Stats                                       │
│─────────────────────────────────────────────────────
│                                                    │
│  Total Earned                              $2.50   │
│  Total Points                              20 pts  │
│  Referrals                                 2       │
│  Account Status                          [Active]  │
│                                                    │
└────────────────────────────────────────────────────┘
```

## Color Palette

### Light Mode
- **Background:** Gray-50 gradient
- **Cards:** White with shadow
- **Primary:** Indigo-600
- **Secondary:** Purple-600
- **Success:** Green-600
- **Warning:** Yellow-600
- **Text Primary:** Gray-900
- **Text Secondary:** Gray-600

### Dark Mode
- **Background:** Gray-900 gradient
- **Cards:** Gray-950 with border
- **Primary:** Indigo-400
- **Secondary:** Purple-400
- **Success:** Green-400
- **Warning:** Yellow-400
- **Text Primary:** White
- **Text Secondary:** Gray-400

## Icons Used

| Icon | Component | Color | Usage |
|------|-----------|-------|-------|
| 💰 DollarSign | USDT Balance | Indigo | Currency indicator |
| 🏆 Trophy | Points | Yellow | Achievement indicator |
| 🎁 Gift | Check-in | Green | Daily reward |
| 👥 Users | Referral Count | - | User count badge |
| ✂️ Copy | Copy Button | - | Copy action |
| ✅ Check | Success State | Green | Confirmation |
| 🕐 Clock | Countdown | - | Time remaining |
| 📈 TrendingUp | Balance Info | Indigo | Growth/Activity |
| 🚪 LogOut | Logout Button | - | Sign out action |

## Responsive Breakpoints

### Desktop (lg: 1024px+)
```
┌────────────────────────────────────────────────┐
│  [===== Left Column (66%) =====] [= Right (33%) =] │
└────────────────────────────────────────────────┘
```

### Tablet (md: 768px - 1023px)
```
┌─────────────────────┐
│  [===== Left =====] │
│                     │
│  [=== Right ===]    │
└─────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────┐
│ [= Balance =]│
│              │
│ [= Points =] │
│              │
│ [= Checkin =]│
│              │
│ [=Referral =]│
│              │
│ [= Stats =]  │
└──────────────┘
```

## Animation & Interactions

### Hover States
- **Buttons:** Slight background darkening
- **Cards:** Subtle shadow increase (optional)
- **Copy button:** Background color change

### Click Feedback
- **Check-in button:** Loading spinner
- **Copy button:** Text changes to "Copied!"
- **Success:** Smooth banner slide-in

### Transitions
- **Button states:** 200ms ease
- **Copy feedback:** 2000ms timeout
- **Countdown update:** 60000ms interval

## Accessibility

- ✅ Semantic HTML (headings, sections)
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Focus indicators on buttons
- ✅ Screen reader friendly
- ✅ Color contrast ratios meet WCAG AA
- ✅ Loading states announced

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers
- ✅ Progressive enhancement

---

**Note:** This preview shows the structure and layout. Actual colors and styling are rendered using Tailwind CSS classes with full dark mode support.
