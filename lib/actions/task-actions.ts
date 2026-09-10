'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { processReferralPayout } from './referral-payout'

interface TaskActionResult {
  success: boolean
  message?: string
  completionId?: string
}

/**
 * Start a task - creates a task_completion record and opens the task link
 * For ad tasks: immediately marks as completed and credits reward
 * For social tasks: marks as verifying, rewards credited after 5 minutes
 */
export async function startTask(taskId: string): Promise<TaskActionResult> {
  const supabase = await createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, message: 'Not authenticated' }
    }

    // Check if user already completed this task
    const { data: existingCompletion } = await supabase
      .from('task_completions')
      .select('id')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .single()

    if (existingCompletion) {
      return { success: false, message: 'You have already completed this task' }
    }

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('is_active', true)
      .single()

    if (taskError || !task) {
      return { success: false, message: 'Task not found' }
    }

    // Create task completion record
    const initialStatus = task.type === 'ad' ? 'pending' : 'verifying'
    
    const { data: completion, error: completionError } = await supabase
      .from('task_completions')
      .insert({
        task_id: taskId,
        user_id: user.id,
        status: initialStatus,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (completionError) {
      console.error('Error creating task completion:', completionError)
      return { success: false, message: 'Failed to start task' }
    }

    // For ad tasks: immediately complete and credit reward
    if (task.type === 'ad') {
      await completeTaskImmediately(completion.id, task.reward_amount, user.id)
    }

    // For social tasks: schedule completion after 5 minutes
    if (task.type === 'social') {
      // We'll use an API route with setTimeout for reliability
      // Call the API route to schedule the completion
      scheduleTaskCompletion(completion.id, task.reward_amount, user.id)
    }

    revalidatePath('/tasks')

    return {
      success: true,
      message: 'Task started successfully',
      completionId: completion.id,
    }
  } catch (error) {
    console.error('Error starting task:', error)
    return { success: false, message: 'An error occurred' }
  }
}

/**
 * Immediately complete an ad task and credit rewards
 */
async function completeTaskImmediately(
  completionId: string,
  rewardAmount: number,
  userId: string
) {
  const supabase = await createClient()

  try {
    // Get user's current balance and points
    const { data: profile } = await supabase
      .from('profiles')
      .select('usdt_balance, points')
      .eq('id', userId)
      .single()

    if (!profile) return

    const newBalance = profile.usdt_balance + rewardAmount
    const newPoints = profile.points + rewardAmount * 10

    // Update profile with new balance and points
    await supabase
      .from('profiles')
      .update({
        usdt_balance: newBalance,
        points: newPoints,
      })
      .eq('id', userId)

    // Mark task completion as completed
    await supabase
      .from('task_completions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        reward_credited: true,
      })
      .eq('id', completionId)

    // Check and process referral payout (first task completion)
    await checkAndProcessReferral(userId)

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Error completing task immediately:', error)
  }
}

/**
 * Schedule task completion after 5 minutes (for social tasks)
 * This is handled client-side with a timer that calls the API route
 */
function scheduleTaskCompletion(completionId: string, rewardAmount: number, userId: string) {
  // The client will handle the 5-minute timer and call the API route
  // We don't need server-side scheduling here
  // The API route at /api/tasks/complete will handle the actual completion
}

/**
 * Complete a social task after verification period
 * Called by the API route after 5 minutes
 */
export async function completeVerifiedTask(completionId: string): Promise<TaskActionResult> {
  const supabase = await createClient()

  try {
    // Get completion details
    const { data: completion, error: completionError } = await supabase
      .from('task_completions')
      .select('*, tasks(*)')
      .eq('id', completionId)
      .single()

    if (completionError || !completion) {
      return { success: false, message: 'Completion not found' }
    }

    // Check if already completed
    if (completion.status === 'completed') {
      return { success: true, message: 'Task already completed' }
    }

    // Check if verification period has passed (5 minutes)
    const startTime = new Date(completion.started_at).getTime()
    const now = Date.now()
    const elapsedMinutes = (now - startTime) / (1000 * 60)

    if (elapsedMinutes < 5) {
      return { success: false, message: 'Verification period not complete' }
    }

    // Get user's current balance and points
    const { data: profile } = await supabase
      .from('profiles')
      .select('usdt_balance, points')
      .eq('id', completion.user_id)
      .single()

    if (!profile) {
      return { success: false, message: 'Profile not found' }
    }

    const rewardAmount = completion.tasks.reward_amount
    const newBalance = profile.usdt_balance + rewardAmount
    const newPoints = profile.points + rewardAmount * 10

    // Update profile with new balance and points
    await supabase
      .from('profiles')
      .update({
        usdt_balance: newBalance,
        points: newPoints,
      })
      .eq('id', completion.user_id)

    // Mark task completion as completed
    await supabase
      .from('task_completions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        reward_credited: true,
      })
      .eq('id', completionId)

    // Check and process referral payout (first task completion)
    await checkAndProcessReferral(completion.user_id)

    revalidatePath('/tasks')
    revalidatePath('/dashboard')

    return { success: true, message: 'Task completed and reward credited' }
  } catch (error) {
    console.error('Error completing verified task:', error)
    return { success: false, message: 'An error occurred' }
  }
}

/**
 * Check if this is the user's first completed task and process referral payout if applicable
 */
async function checkAndProcessReferral(userId: string) {
  const supabase = await createClient()

  try {
    // Count completed tasks for this user
    const { data: completions, error } = await supabase
      .from('task_completions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (error) {
      console.error('Error checking task completions:', error)
      return
    }

    // If this is the first completed task, process referral payout
    if (completions && completions.length === 1) {
      await processReferralPayout(userId)
    }
  } catch (error) {
    console.error('Error in checkAndProcessReferral:', error)
  }
}
