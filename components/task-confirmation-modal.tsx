'use client'

import { TaskType } from '@/lib/types/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { AlertTriangle } from 'lucide-react'

interface TaskConfirmationModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  taskType: TaskType
}

export function TaskConfirmationModal({
  open,
  onClose,
  onConfirm,
  taskType,
}: TaskConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Task Verification Notice
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-4">
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              Tasks are monitored. If not completed, you may not receive your reward.
            </p>
            
            {taskType === 'social' && (
              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Social tasks</strong> will be verified within 5 minutes after you complete
                  them. Please complete the task before closing the page.
                </p>
              </div>
            )}
            
            {taskType === 'ad' && (
              <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                <p className="text-sm text-purple-900 dark:text-purple-200">
                  <strong>Ad tasks</strong> are verified instantly. Your reward will be credited
                  immediately after viewing.
                </p>
              </div>
            )}

            <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>You can only complete each task once</li>
              <li>The task link will open in a new tab</li>
              <li>Complete the task fully to receive your reward</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Proceed to Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
