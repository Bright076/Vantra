# Tasks System - Quick Setup Guide

## 🚀 Setup Steps

### 1. Run Database Migration

Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Copy and paste the entire contents of:
-- supabase/migrations/003_tasks_system.sql
```

This creates:
- `tasks` table
- `task_completions` table  
- Enums for task types and statuses
- RLS policies
- Sample tasks

### 2. Verify Tables Created

Run this to check:
```sql
SELECT * FROM tasks;
SELECT * FROM task_completions;
```

You should see 6 sample tasks.

### 3. Start the Dev Server

```bash
bun run dev
```

### 4. Test the Tasks Page

1. Login to your account
2. Navigate to http://localhost:3000/tasks
3. You should see:
   - "Watch & Earn" section with ad tasks
   - "Social Tasks" section with social tasks

## 📋 What Was Built

### Files Created

**Pages:**
- `app/tasks/page.tsx` - Main tasks page

**Components:**
- `components/task-card.tsx` - Individual task card
- `components/task-list.tsx` - Task grid layout
- `components/task-confirmation-modal.tsx` - Warning modal
- `components/ui/dialog.tsx` - Modal component (shadcn/ui)

**Server Actions:**
- `lib/actions/task-actions.ts` - Task completion logic

**API Routes:**
- `app/api/tasks/complete/route.ts` - Complete verified tasks

**Database:**
- `supabase/migrations/003_tasks_system.sql` - Full schema

**Types:**
- Updated `lib/types/database.ts` with Task types

**Documentation:**
- `TASKS_SYSTEM.md` - Complete technical documentation
- `TASKS_SETUP.md` - This file

## 🎯 Quick Test

### Test Ad Task (Instant Reward)

1. Go to `/tasks`
2. Click "Perform Task" on any ad task
3. See confirmation modal
4. Click "Proceed"
5. Task link opens in new tab
6. Return to tasks page
7. ✅ Status shows "Completed"
8. ✅ Balance increased instantly
9. ✅ Points increased instantly
10. ✅ Button disabled

### Test Social Task (5-Minute Verification)

1. Go to `/tasks`
2. Click "Perform Task" on social task
3. See confirmation modal with 5-min notice
4. Click "Proceed"
5. Task link opens in new tab
6. Return to tasks page
7. ⏳ Status shows "Verifying..."
8. ⏳ See countdown timer (5:00, 4:59, 4:58...)
9. Wait 5 minutes ☕
10. ✅ Status changes to "Completed"
11. ✅ Balance increases
12. ✅ Points increase
13. ✅ Button disabled

### Test Duplicate Prevention

1. Complete a task
2. Refresh page
3. Task shows "Completed"
4. Button is disabled
5. Try clicking anyway
6. ❌ Nothing happens (button disabled)

### Test Referral Integration

1. **Setup:**
   - User A signs up normally
   - Copy User A's referral code
   - Logout

2. **Signup with Referral:**
   - Go to `/signup?ref=USER_A_CODE`
   - Create User B account
   - Login as User B

3. **Complete First Task:**
   - Go to `/tasks`
   - Complete any task (ad task for instant result)
   - Check completion

4. **Verify Referrer Rewarded:**
   - Logout
   - Login as User A
   - Go to `/dashboard`
   - ✅ Balance increased by $1
   - ✅ Points increased by 10
   - Check database: referral status = 'paid'

5. **Complete Second Task:**
   - Login as User B
   - Complete another task
   - Logout, login as User A
   - ❌ No additional referral reward (only first task)

## ⚙️ Configuration

### Change Verification Time

Edit `components/task-card.tsx`:
```typescript
// Change 5 minutes to desired time
const endTime = startTime + 5 * 60 * 1000  // 5 minutes
//                           ↑ Change this number
```

### Add New Tasks

```sql
INSERT INTO tasks (title, description, type, reward_amount, task_link)
VALUES (
  'Your Task Title',
  'Task description',
  'ad',  -- or 'social'
  1.50,  -- reward amount
  'https://example.com/task'
);
```

### Deactivate Tasks

```sql
UPDATE tasks 
SET is_active = false 
WHERE id = 'task-uuid';
```

## 🎨 Customization

### Change Reward Formula

Currently: `reward_amount * 10` for points

Edit `lib/actions/task-actions.ts`:
```typescript
const newPoints = profile.points + rewardAmount * 10
//                                               ↑ Change multiplier
```

### Add Ad Network Script

Update task with ad slot HTML:
```sql
UPDATE tasks
SET ad_network_slot = '<script>/* Ad network code */</script>'
WHERE id = 'task-uuid';
```

The HTML will render in the task card's AdSlot section.

## 🐛 Troubleshooting

### Tasks page blank
- Check database migration ran successfully
- Verify sample tasks were inserted
- Check browser console for errors

### Modal not showing
- Check `@radix-ui/react-dialog` is installed
- Verify no CSS conflicts
- Check browser console

### Countdown not working
- Check browser supports `Date()` API
- Verify `started_at` timestamp is valid
- Check component re-renders properly

### Rewards not credited
- Check API route returns success
- Verify profile balance is updating
- Check database transaction completed
- Look for errors in server logs

## 📊 Database Queries

### View All Completions
```sql
SELECT 
  tc.*,
  t.title,
  p.email
FROM task_completions tc
JOIN tasks t ON tc.task_id = t.id
JOIN profiles p ON tc.user_id = p.id
ORDER BY tc.created_at DESC;
```

### Check User's Tasks
```sql
SELECT 
  t.title,
  t.type,
  tc.status,
  tc.started_at,
  tc.completed_at
FROM task_completions tc
JOIN tasks t ON tc.task_id = t.id
WHERE tc.user_id = 'user-uuid'
ORDER BY tc.created_at DESC;
```

### View Task Statistics
```sql
SELECT 
  t.title,
  t.type,
  COUNT(tc.id) as total_completions,
  COUNT(CASE WHEN tc.status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN tc.status = 'verifying' THEN 1 END) as verifying
FROM tasks t
LEFT JOIN task_completions tc ON t.id = tc.task_id
GROUP BY t.id, t.title, t.type
ORDER BY total_completions DESC;
```

## ✅ Success Checklist

After setup, verify:

- [ ] Migration ran successfully
- [ ] Sample tasks visible in database
- [ ] `/tasks` page loads
- [ ] Tasks split into two sections
- [ ] Can click "Perform Task"
- [ ] Modal appears with warning
- [ ] Task link opens in new tab
- [ ] Ad tasks complete instantly
- [ ] Social tasks show countdown
- [ ] Countdown reaches zero
- [ ] Rewards credited correctly
- [ ] Cannot complete task twice
- [ ] First task triggers referral payout
- [ ] Dashboard balance updates
- [ ] Points update correctly

## 🎉 You're Done!

The tasks system is now fully functional. Users can:
- Browse available tasks
- Complete ad tasks for instant rewards
- Complete social tasks with verification
- Earn USDT and points
- Trigger referral payouts on first task

Next steps:
- Add more tasks via SQL
- Integrate real ad network scripts
- Create admin panel for task management
- Add task history page

---

**Need Help?** See TASKS_SYSTEM.md for detailed documentation.
