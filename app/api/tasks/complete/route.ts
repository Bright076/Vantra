import { NextRequest, NextResponse } from 'next/server'
import { completeVerifiedTask } from '@/lib/actions/task-actions'

/**
 * API route to complete a verified social task
 * Called by the client after 5-minute verification period
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { completionId } = body

    if (!completionId) {
      return NextResponse.json({ success: false, message: 'Missing completionId' }, { status: 400 })
    }

    const result = await completeVerifiedTask(completionId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in complete task API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
