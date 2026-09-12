import { ProtectedRoute } from '@/lib/auth/protected-route'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TaskList } from '@/components/task-list'
import { BottomNav } from '@/components/bottom-nav'
import { Tv, Users } from 'lucide-react'

export default async function TasksPage() {
  const userData = await getUser()

  if (!userData) {
    redirect('/login')
  }

  const { user } = userData

  // Redirect admins
  if (userData.profile.role === 'admin') {
    redirect('/admin')
  }

  const supabase = await createClient()

  // Fetch all active tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Fetch user's task completions
  const { data: completions, error: completionsError } = await supabase
    .from('task_completions')
    .select('*')
    .eq('user_id', user.id)

  if (tasksError || completionsError) {
    console.error('Error fetching tasks:', tasksError, completionsError)
  }

  // Split tasks by type
  const adTasks = tasks?.filter((task) => task.type === 'ad') || []
  const socialTasks = tasks?.filter((task) => task.type === 'social') || []

  return (
    <ProtectedRoute requiredRole="user">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pb-20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Available Tasks</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Complete tasks to earn USDT and points
            </p>
          </div>

          <div className="space-y-8">
            {/* Watch & Earn Section */}
            <section>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                  <Tv className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Watch & Earn
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Watch ads and videos to earn instant rewards
                  </p>
                </div>
              </div>
              <TaskList tasks={adTasks} completions={completions || []} />
            </section>

            {/* Social Tasks Section */}
            <section>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Social Tasks
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Follow, like, and share on social media
                  </p>
                </div>
              </div>
              <TaskList tasks={socialTasks} completions={completions || []} />
            </section>
          </div>
        </div>
      </div>
      <BottomNav />
    </ProtectedRoute>
  )
}
