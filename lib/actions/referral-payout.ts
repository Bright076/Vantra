'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Process referral payout when a user completes their first task.
 * Call this function after a task is completed.
 * 
 * @param userId - The ID of the user who completed the task
 * @returns true if a referral was processed, false if no pending referral found
 */
export async function processReferralPayout(userId: string): Promise<boolean> {
  const supabase = await createClient()

  try {
    // 1. Check for pending referral for this user
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_id', userId)
      .eq('status', 'pending')
      .single()

    if (referralError || !referral) {
      // No pending referral found - this is normal for non-referred users
      return false
    }

    // 2. Get referrer's current balance and points
    const { data: referrerProfile, error: referrerError } = await supabase
      .from('profiles')
      .select('usdt_balance, points')
      .eq('id', referral.referrer_id)
      .single()

    if (referrerError || !referrerProfile) {
      console.error('Failed to fetch referrer profile:', referrerError)
      return false
    }

    // 3. Credit the referrer with $1 + 10 points
    const newBalance = referrerProfile.usdt_balance + referral.reward_amount
    const newPoints = referrerProfile.points + 10

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        usdt_balance: newBalance,
        points: newPoints,
      })
      .eq('id', referral.referrer_id)

    if (updateError) {
      console.error('Failed to update referrer balance:', updateError)
      return false
    }

    // 4. Mark referral as paid
    const { error: payoutError } = await supabase
      .from('referrals')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', referral.id)

    if (payoutError) {
      console.error('Failed to mark referral as paid:', payoutError)
      // Note: Balance was already updated, but status update failed
      // You may want to handle this with a retry mechanism or alert
      return false
    }

    console.log(
      `Referral payout successful: User ${referral.referrer_id} received $${referral.reward_amount} + 10 points`
    )
    return true
  } catch (error) {
    console.error('Error processing referral payout:', error)
    return false
  }
}
