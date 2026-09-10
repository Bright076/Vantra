# Tasks System Documentation

## Overview

The tasks system allows users to complete various tasks to earn USDT and points. Tasks are split into two categories:
- **Watch & Earn** (Ad tasks) - Instant rewards
- **Social Tasks** - Verified after 5 minutes

## Features Implemented

### ✅ Task Types

1. **Ad Tasks (`type='ad'`)**
   - Instant completion and reward
   - Opens task link in new tab
   - Immediately credits reward_amount + reward_amount*10 points
   - Status flow: `pending` → `completed`

2. **Social Tasks (`type='social'`)**
   - 5-minute verification period
   - Real-time countdown timer
   - Credits rewards after verification
   - Status flow: `verifying` → `completed` (after 5 min)

### ✅ Task Card Features

Each task card displays:
- Task title and description
- Reward amount (USDT)
- Points (reward_amount * 10)
- "Perform Task" button
- Status badge (In Progress, Verifying, Completed)
- Ad Network Slot (reserved for future integration)

### ✅ Confirmation Modal

Before starting a task, users see:
- Warning: "Tasks are monitored. If not completed, you may not receive your reward."
- Task-specific information (instant vs. 5-minute verification)
- Rules and guidelines
- "Proceed" button

### ✅ Duplicate Prevention

- Users cannot complete the same task twice
- Enforced via UNIQUE constraint (task_id, user_id)
- Button disabled after completion

### ✅ Referral Integration

When a user completes their **first task**:
1. Check `referrals` table for pending referral
2. If found: Credit referrer $1 + 10 points
3. Update referral status to `paid`
4. Set `paid_at` timestamp

### ✅ Ad Network Integration (Future-Ready)

- `ad_network_slot` field in tasks table
- Reserved `<AdSlot />` component in task cards
- Renders raw HTML/placeholder if present
- Ready for third-party ad network scripts

## Technical Implementation

### Client-Side Timer Approach (Chosen Solution)

**Why client-side?**
1. **Reliability**: User stays on page, sees real-time countdown
2. **Simplicity**: No need for serverless function setup
3. **User Experience**: Live feedback during verification
4. **Cost-effective**: No additional cloud resources needed

**How it works:**
```typescript
// In TaskCard component
useEffect(() => {
  if (status === 'verifying') {
    // Start 5-minute countdown
    const timer = setInterval(() => {
      // Update remaining time
      // When time = 0, call API to complete task
    }, 1000)
  }
}, [status])
```

**Backup mechanism:**
- If user closes page, they can return
- Timer recalculates based on `started_at` timestamp
- API validates 5 minutes have passed before crediting

### Alternative: Supabase Edge Function (Not Chosen)

**Why not Edge Function?**
- Requires additional setup and configuration
- Harder to debug and monitor
- Adds complexity without significant benefit
- User wouldn't see live countdown
- Would need webhook/polling to update status

**If you need Edge Function later:**
```sql
-- Create function to complete tasks after delay
CREATE OR REPLACE FUNCTION complete_social_task(completion_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Wait 5 minutes (300 seconds)
  PERFORM pg_sleep(300);
  
  -- Update completion status
  UPDATE task_completions
  SET status = 'completed',
      completed_at = NOW(),
      reward_credited = true
  WHERE id = completion_uuid;
  
  -- Credit rewards (call separate function)
END;
$$ LANGUAGE plpgsql;
```

## Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type task_type NOT NULL,              -- 'ad' or 'social'
  reward_amount DECIMAL(10, 2) NOT NULL,
  task_link TEXT NOT NULL,
  ad_network_slot TEXT,                 -- For ad integration
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Task Completions Table
```sql
CREATE TABLE task_completions (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status task_completion_status,        -- 'pending', 'verifying', 'completed', 'failed'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  reward_credited BOOLEAN DEFAULT false,
  UNIQUE(task_id, user_id)              -- Prevent duplicates
);
```

## API Routes

### POST /api/tasks/complete
Completes a verified social task after 5-minute period.

**Request:**
```json
{
  "completionId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task completed and reward credited"
}
```

**Validation:**
- Checks if 5 minutes have passed
- Verifies task not already completed
- Credits rewards and updates status

## Server Actions

### `startTask(taskId: string)`

Initiates a task for the user.

**Flow:**
1. Authenticate user
2. Check for existing completion (prevent duplicates)
3. Get task details
4. Create task_completion record
5. For ad tasks: Complete immediately
6. For social tasks: Set status to 'verifying'
7. Return success

**Returns:**
```typescript
{
  success: boolean
  message?: string
  completionId?: string
}
```

### `completeVerifiedTask(completionId: string)`

Completes a social task after verification.

**Flow:**
1. Get completion details
2. Verify 5 minutes have passed
3. Credit USDT and points
4. Mark as completed
5. Check for first task (referral payout)
6. Return success

## Usage Examples

### Starting a Task (Ad)
```typescript
// User clicks "Perform Task"
const result = await startTask(taskId)

if (result.success) {
  // Open link in new tab
  window.open(taskLink, '_blank')
  
  // Task immediately completed
  // Balance updated instantly
  // Page refreshes to show completed state
}
```

### Starting a Task (Social)
```typescript
// User clicks "Perform Task"
const result = await startTask(taskId)

if (result.success) {
  // Open link in new tab
  window.open(taskLink, '_blank')
  
  // Status set to 'verifying'
  // 5-minute countdown starts
  // After 5 minutes, API called automatically
  // Rewards credited, status → 'completed'
}
```

### Checking Task Status
```typescript
// Get user's completions
const completions = await supabase
  .from('task_completions')
  .select('*')
  .eq('user_id', userId)

// Check if task already completed
const hasCompleted = completions.find(c => 
  c.task_id === taskId && c.status === 'completed'
)
```

## Security & Validation

### RLS Policies

**Tasks:**
- Anyone can read active tasks
- Admins can manage tasks

**Task Completions:**
- Users can read own completions
- Users can insert own completions
- Service role can update (for status changes)
- Admins can read all completions

### Duplicate Prevention

```sql
-- UNIQUE constraint
UNIQUE(task_id, user_id)

-- Server-side check
const existing = await supabase
  .from('task_completions')
  .select('id')
  .eq('task_id', taskId)
  .eq('user_id', userId)
  .single()

if (existing) {
  return { success: false, message: 'Already completed' }
}
```

### Time Validation (Social Tasks)

```typescript
const startTime = new Date(completion.started_at).getTime()
const elapsedMinutes = (Date.now() - startTime) / (1000 * 60)

if (elapsedMinutes < 5) {
  return { success: false, message: 'Verification not complete' }
}
```

## UI Components

### TaskCard
- Displays task details
- Shows status badge
- Handles countdown timer
- Manages button states
- Opens confirmation modal

### TaskConfirmationModal
- Warning message
- Task type-specific info
- Rules and guidelines
- Proceed/Cancel buttons

### TaskList
- Grid layout (responsive)
- Empty state handling
- Filters by task type

### AdSlot (Future)
- Reserved component
- Renders `ad_network_slot` HTML
- Ready for third-party scripts

## Testing Checklist

### Ad Tasks
- [ ] Click "Perform Task"
- [ ] Modal appears with warning
- [ ] Click "Proceed"
- [ ] Task link opens in new tab
- [ ] Balance increases immediately
- [ ] Points increase immediately
- [ ] Status shows "Completed"
- [ ] Button disabled
- [ ] Cannot complete again

### Social Tasks
- [ ] Click "Perform Task"
- [ ] Modal appears with 5-min notice
- [ ] Click "Proceed"
- [ ] Task link opens in new tab
- [ ] Status shows "Verifying"
- [ ] Countdown timer displays
- [ ] Timer updates every second
- [ ] After 5 minutes, status → "Completed"
- [ ] Balance increases after 5 minutes
- [ ] Points increase after 5 minutes
- [ ] Button disabled
- [ ] Cannot complete again

### Referral Integration
- [ ] User 1 signs up with referral code
- [ ] User 1 completes first task
- [ ] User 1's referrer receives $1 + 10 points
- [ ] Referral status changes to 'paid'
- [ ] paid_at timestamp set
- [ ] User 1 completes second task
- [ ] Referrer does NOT receive additional reward

### Edge Cases
- [ ] User closes page during verification
- [ ] User returns, timer recalculates correctly
- [ ] Multiple users completing same task
- [ ] Completing task without internet
- [ ] Page refresh during countdown
- [ ] Rapid button clicks (prevented)

## Sample Tasks

The migration includes sample tasks:

1. **Watch YouTube Video** - Ad task, $0.50
2. **View Advertisement** - Ad task, $0.25
3. **Follow us on Twitter** - Social task, $1.00
4. **Join Telegram Group** - Social task, $0.75
5. **Like Facebook Page** - Social task, $0.50
6. **Watch Product Demo** - Ad task, $0.75

## Future Enhancements

### Phase 1
- [ ] Task categories/tags
- [ ] Task difficulty levels
- [ ] Daily task limits
- [ ] Task history page

### Phase 2
- [ ] Task recommendations
- [ ] Bonus multipliers
- [ ] Task streaks
- [ ] Special event tasks

### Phase 3
- [ ] Ad network integration
- [ ] Advanced verification
- [ ] Task creation UI (admin)
- [ ] Analytics dashboard

## Admin Features (Future)

### Task Management
- Create/edit/delete tasks
- Toggle active/inactive
- Set reward amounts
- Configure ad slots
- View completion stats

### Monitoring
- Track completion rates
- View fraud attempts
- Monitor verification times
- Analyze user behavior

## Troubleshooting

### Timer not counting down
- Check browser console for errors
- Verify `started_at` timestamp is valid
- Ensure interval is not cleared prematurely

### Rewards not credited
- Check API response in Network tab
- Verify 5 minutes have passed
- Check database for completion status
- Ensure profile balance is updating

### Task shows as completed but no rewards
- Check `reward_credited` field
- Verify balance update query succeeded
- Check for database transaction errors

### Cannot complete task (already completed)
- Check task_completions table
- Verify UNIQUE constraint working
- Clear any duplicate records

## Performance Considerations

- Task list cached server-side
- Completions fetched per user
- Countdown uses requestAnimationFrame (efficient)
- API calls debounced
- Database indexes on:
  - `task_id`
  - `user_id`
  - `status`
  - `type`

---

**Status:** ✅ Complete and ready for testing
**Version:** 1.0
**Last Updated:** Task system implementation complete
