'use client'

import { Task, TaskCompletion } from '@/lib/types/database'
import { TaskCard } from './task-card'

interface TaskListProps {
  tasks: Task[]
  completions: TaskCompletion[]
}

export function TaskList({ tasks, completions }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No tasks available at the moment</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => {
        const completion = completions.find((c) => c.task_id === task.id)
        return <TaskCard key={task.id} task={task} completion={completion} />
      })}
    </div>
  )
}
