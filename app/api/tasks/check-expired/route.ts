import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { completeVerifiedTask } from '@/lib/actions/task-actions'

/**
 * API route to check and complete expired verifying tasks
 * This runs on every page load to ensure tasks complete even if user closes page
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Get all verifying tasks
    const { data: verifyingTasks, error } = await supabase
      .from('task_completions')
      .select('id, started_at, user_id')
      .eq('status', 'verifying')

    if (error) {
      console.error('Error fetching verifying tasks:', error)
      return NextResponse.json({ success: false, error: error.message })
    }

    const now = Date.now()
    const completedTasks: string[] = []
    const failedTasks: string[] = []

    // Check each verifying task
    for (const task of verifyingTasks || []) {
      const startTime = new Date(task.started_at).getTime()
      const elapsedMinutes = (now - startTime) / (1000 * 60)

      // If 5 minutes have passed, complete it
      if (elapsedMinutes >= 5) {
        const result = await completeVerifiedTask(task.id)
        if (result.success) {
          completedTasks.push(task.id)
        } else {
          failedTasks.push(task.id)
        }
      }
    }

    return NextResponse.json({
      success: true,
      completed: completedTasks.length,
      failed: failedTasks.length,
      completedTasks,
      failedTasks,
    })
  } catch (error) {
    console.error('Error in check-expired:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
