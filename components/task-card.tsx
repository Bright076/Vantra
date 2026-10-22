'use client'

import { useState, useEffect, useRef } from 'react'
import { Task, TaskCompletion } from '@/lib/types/database'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Toast } from './ui/toast'
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
  const [showToast, setShowToast] = useState(false)
  const completionAttempted = useRef(false) // Track if we already tried to complete this

  // Silent background verification for social tasks - NO UI, NO TOAST on mount
  useEffect(() => {
    if (completion?.status === 'verifying' && task.type === 'social' && !completionAttempted.current) {
      const startTime = new Date(completion.started_at).getTime()
      const endTime = startTime + 5 * 60 * 1000 // 5 minutes
      const now = Date.now()
      const remaining = endTime - now

      // If time already passed, complete immediately (silently, no toast)
      if (remaining <= 0) {
        completionAttempted.current = true
        completeVerifiedTaskSilently(completion.id)
        return
      }

      // Set timeout to complete after remaining time
      const timeout = setTimeout(() => {
        completionAttempted.current = true
        completeVerifiedTaskSilently(completion.id)
      }, remaining)

      return () => clearTimeout(timeout)
    }
  }, [completion?.id, completion?.status, completion?.started_at, task.type])

  const completeVerifiedTaskSilently = async (completionId: string) => {
    try {
      const response = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completionId }),
      })

      const result = await response.json()

      if (result.success) {
        // Refresh to show completed state - NO TOAST
        router.refresh()
      }
    } catch (error) {
      console.error('Error completing verified task:', error)
    }
  }

  const handlePerformTask = async () => {
    // Prevent multiple clicks
    if (loading) return
    
    setLoading(true)
    try {
      // Inject ad script for ad-type tasks
      if (task.type === 'ad' && task.ad_network_slot) {
        const scriptContainer = document.createElement('div')
        scriptContainer.innerHTML = task.ad_network_slot
        
        const scripts = scriptContainer.getElementsByTagName('script')
        for (let i = 0; i < scripts.length; i++) {
          const oldScript = scripts[i]
          const newScript = document.createElement('script')
          
          Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value)
          })
          
          if (oldScript.src) {
            newScript.src = oldScript.src
          } else {
            newScript.textContent = oldScript.textContent
          }
          
          document.body.appendChild(newScript)
          
          setTimeout(() => {
            if (newScript.parentNode) {
              newScript.parentNode.removeChild(newScript)
            }
          }, 5000)
        }
      }
      
      // Start the task
      const result = await startTask(task.id)
      
      if (result.success) {
        // Show success toast ONLY for ad tasks (instant completion)
        if (task.type === 'ad') {
          setShowToast(true)
        }
        
        // Open task link in new tab (if link exists)
        if (task.link) {
          window.open(task.link, '_blank', 'noopener,noreferrer')
        }
        
        // Refresh to show updated state
        setTimeout(() => {
          router.refresh()
        }, task.type === 'ad' ? 1500 : 500)
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

    // Ad tasks: only show completed
    if (task.type === 'ad' && completion.status === 'completed') {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      )
    }

    // Social tasks
    if (task.type === 'social') {
      if (completion.status === 'completed') {
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      }
      if (completion.status === 'verifying') {
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Pending Approval
          </Badge>
        )
      }
    }

    return null
  }

  const isCompleted = completion?.status === 'completed'
  const isVerifying = completion?.status === 'verifying' && task.type === 'social'

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

          {/* Waiting for approval message - NO TIMER */}
          {isVerifying && (
            <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
              <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="h-4 w-4" />
                <span>Waiting for admin confirmation. You can redo the task if you forgot to complete it.</span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={() => setShowModal(true)}
            disabled={isCompleted || loading}
            className="w-full"
            variant={isCompleted ? 'outline' : isVerifying ? 'secondary' : 'default'}
          >
            {loading ? (
              'Loading...'
            ) : isCompleted ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Completed
              </>
            ) : isVerifying ? (
              'Redo Task'
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

      {/* Toast ONLY for ad tasks when manually completed */}
      {showToast && (
        <Toast
          title="Task Completed!"
          description="Your reward has been added to your balance."
          variant="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  )
}
