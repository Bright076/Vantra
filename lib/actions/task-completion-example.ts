'use server'

import { createClient } from '@/lib/supabase/server'
import { processReferralPayout } from './referral-payout'

/**
 * Example function showing how to integrate referral payout
 * into your task completion flow.
 * 
 * THIS IS AN EXAMPLE - Replace with your actual task completion logic
 */
export async function completeTask(userId: string, taskId: string) {
  const supabase = await createClient()

  try {
    // 1. Your task completion logic here
    // For example:
    // - Verify task is completed
    // - Update task status in database
    // - Calculate task reward
    // const taskReward = 5.00 // Example: $5 for completing the task
    
    // 2. Check if this is the user's first completed task
    // You might want to add a tasks table and check completion count
    // For this example, we'll assume you have a way to check this
    
    // Example query (adjust to your schema):
    // const { data: completedTasks, error } = await supabase
    //   .from('tasks')
    //   .select('id')
    //   .eq('user_id', userId)
    //   .eq('status', 'completed')
    
    // const isFirstTask = completedTasks?.length === 0
    
    // 3. Process referral payout if this is the first task
    // const referralProcessed = await processReferralPayout(userId)
    
    // if (referralProcessed) {
    //   console.log(`Referral reward paid out for user ${userId}'s first task completion`)
    // }
    
    // 4. Credit the user for completing the task
    // const { data: profile } = await supabase
    //   .from('profiles')
    //   .select('balance, points')
    //   .eq('id', userId)
    //   .single()
    
    // if (profile) {
    //   await supabase
    //     .from('profiles')
    //     .update({
    //       balance: profile.balance + taskReward,
    //       points: profile.points + 50, // Example: 50 points per task
    //     })
    //     .eq('id', userId)
    // }
    
    return {
      success: true,
      message: 'Task completed successfully',
    }
  } catch (error) {
    console.error('Error completing task:', error)
    return {
      success: false,
      message: 'Failed to complete task',
    }
  }
}

/**
 * More direct example: Call this after any successful task completion
 */
export async function onTaskComplete(userId: string) {
  // After updating task status and crediting user...
  
  // Check and process referral payout
  const referralProcessed = await processReferralPayout(userId)
  
  if (referralProcessed) {
    return {
      message: 'Task completed! Your referrer has been credited $1 + 10 points.',
      referralBonus: true,
    }
  }
  
  return {
    message: 'Task completed successfully!',
    referralBonus: false,
  }
}
