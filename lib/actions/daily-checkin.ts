'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface CheckinResult {
  success: boolean
  message: string
  newBalance?: number
  newPoints?: number
  nextCheckinAt?: string
}

/**
 * Process daily check-in for a user
 * Awards $0.50 to balance and 5 points
 * Can only be done once per 24 hours
 */
export async function processDailyCheckin(): Promise<CheckinResult> {
  const supabase = await createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        message: 'Not authenticated',
      }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('usdt_balance, points, last_checkin_at')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return {
        success: false,
        message: 'Failed to fetch profile',
      }
    }

    // Check if user can check in (24 hours since last check-in)
    const now = new Date()
    const lastCheckin = profile.last_checkin_at ? new Date(profile.last_checkin_at) : null

    if (lastCheckin) {
      const hoursSinceLastCheckin = (now.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60)

      if (hoursSinceLastCheckin < 24) {
        const nextCheckin = new Date(lastCheckin.getTime() + 24 * 60 * 60 * 1000)
        return {
          success: false,
          message: 'Check-in not available yet',
          nextCheckinAt: nextCheckin.toISOString(),
        }
      }
    }

    // Process check-in: add $0.50 and 5 points
    const newBalance = profile.usdt_balance + 0.5
    const newPoints = profile.points + 5

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        usdt_balance: newBalance,
        points: newPoints,
        last_checkin_at: now.toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to update profile:', updateError)
      return {
        success: false,
        message: 'Failed to process check-in',
      }
    }

    // Revalidate the dashboard page to show updated data
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Check-in successful! You earned $0.50 and 5 points.',
      newBalance,
      newPoints,
      nextCheckinAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    }
  } catch (error) {
    console.error('Error processing daily check-in:', error)
    return {
      success: false,
      message: 'An error occurred during check-in',
    }
  }
}

/**
 * Get time remaining until next check-in
 */
export async function getNextCheckinTime(): Promise<{
  canCheckin: boolean
  nextCheckinAt: string | null
  hoursRemaining: number | null
}> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { canCheckin: false, nextCheckinAt: null, hoursRemaining: null }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('last_checkin_at')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.last_checkin_at) {
      return { canCheckin: true, nextCheckinAt: null, hoursRemaining: null }
    }

    const now = new Date()
    const lastCheckin = new Date(profile.last_checkin_at)
    const hoursSinceLastCheckin = (now.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60)

    if (hoursSinceLastCheckin >= 24) {
      return { canCheckin: true, nextCheckinAt: null, hoursRemaining: null }
    }

    const nextCheckin = new Date(lastCheckin.getTime() + 24 * 60 * 60 * 1000)
    const hoursRemaining = Math.ceil((nextCheckin.getTime() - now.getTime()) / (1000 * 60 * 60))

    return {
      canCheckin: false,
      nextCheckinAt: nextCheckin.toISOString(),
      hoursRemaining,
    }
  } catch (error) {
    console.error('Error getting next check-in time:', error)
    return { canCheckin: false, nextCheckinAt: null, hoursRemaining: null }
  }
}
