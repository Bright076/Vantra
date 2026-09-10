'use client'

import { useState, useEffect } from 'react'
import { Task, TaskCompletion } from '@/lib/types/database'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { DollarSign, Trophy, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { TaskConfirmationModal } from './task-confirmation-modal'
import { startTask } from '@/lib/actions/task-actions'
import { useRouter } from 'next/navigation'

interface TaskCardProps {
  task: Task
  completion?: TaskCompletion
}

export function TaskCard({ task, completion }: TaskCardProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  // Handle 5-minute verification for social tasks
  useEffect(() => {
    if (completion?.status === 'verifying' && task.type === 'social') {
      const startTime = new Date(completion.started_at).getTime()
      const endTime = startTime + 5 * 60 * 1000 // 5 minutes

      const updateTimer = () => {
        const now = Date.now()
        const remaining = Math.max(0, endTime - now)
        setTimeRemaining(remaining)

        // If timer is complete, call API to complete the task
        if (remaining === 0) {
          completeVerifiedTask(completion.id)
        }
      }

      updateTimer()
      const interval = setInterval(updateTimer, 1000)

      return () => clearInterval(interval)
    }
  }, [completion, task.type])

  const completeVerifiedTask = async (completionId: string) => {
    try {
      const response = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completionId }),
      })

      const result = await response.json()

      if (result.success) {
        // Refresh to show completed state
        router.refresh()
      }
    } catch (error) {
      console.error('Error completing verified task:', error)
    }
  }

  const handlePerformTask = async () => {
    setLoading(true)
    try {
      const result = await startTask(task.id)
      
      if (result.success) {
        // Open task link in new tab
        window.open(task.task_link, '_blank', 'noopener,noreferrer')
        
        // Refresh to show updated state
        router.refresh()
      } else {
        alert(result.message || 'Failed to start task')
      }
    } catch (error) {
      console.error('Error starting task:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
      setShowModal(false)
    }
  }

  const getStatusBadge = () => {
    if (!completion) return null

    switch (completion.status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      case 'verifying':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Verifying
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Clock className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        )
      default:
        return null
    }
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const isCompleted = completion?.status === 'completed'
  const isInProgress = completion && completion.status !== 'completed'
  const isVerifying = completion?.status === 'verifying'

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            {getStatusBadge()}
          </div>
          {task.description && (
            <CardDescription className="line-clamp-2">{task.description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          {/* Ad Network Slot - Reserved for future integration */}
          {task.ad_network_slot && task.type === 'ad' && (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                <AlertCircle className="mx-auto mb-1 h-4 w-4" />
                <p>Ad Network Slot</p>
                {/* Future: Third-party ad script will render here */}
                {/* For now, just show placeholder text */}
                <div
                  className="mt-2 text-xs"
                  dangerouslySetInnerHTML={{ __html: task.ad_network_slot }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-green-100 p-1.5 dark:bg-green-900">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reward</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${task.reward_amount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-yellow-100 p-1.5 dark:bg-yellow-900">
                <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Points</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {(task.reward_amount * 10).toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Timer */}
          {isVerifying && timeRemaining !== null && timeRemaining > 0 && (
            <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
              <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                <Clock className="h-4 w-4 animate-spin" />
                <span>Verifying... {formatTime(timeRemaining)} remaining</span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={() => setShowModal(true)}
            disabled={isCompleted || isInProgress || loading}
            className="w-full"
            variant={isCompleted ? 'outline' : 'default'}
          >
            {loading ? (
              'Loading...'
            ) : isCompleted ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Completed
              </>
            ) : isVerifying ? (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Verifying...
              </>
            ) : isInProgress ? (
              'In Progress'
            ) : (
              'Perform Task'
            )}
          </Button>
        </CardFooter>
      </Card>

      <TaskConfirmationModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handlePerformTask}
        taskType={task.type}
      />
    </>
  )
}
