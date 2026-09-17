import { ProtectedRoute } from '@/lib/auth/protected-route'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/bottom-nav'
import { ArrowLeft, CheckCircle2, DollarSign, Trophy, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function CompletedTasksPage() {
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

  // Fetch user's completed tasks with task details
  const { data: completedTasks, error } = await supabase
    .from('task_completions')
    .select(`
      *,
      tasks (
        id,
        title,
        type,
        reward_amount,
        description
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  if (error) {
    console.error('Error fetching completed tasks:', error)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <ProtectedRoute requiredRole="user">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pb-20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <a
              href="/tasks"
              className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Available Tasks
            </a>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Completed Tasks
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your task completion history
            </p>
          </div>

          {/* Stats Summary */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {completedTasks?.length || 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    $
                    {completedTasks
                      ?.reduce((sum, ct) => sum + (ct.tasks?.reward_amount || 0), 0)
                      .toFixed(2) || '0.00'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900">
                  <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Points Earned</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {completedTasks
                      ?.reduce((sum, ct) => sum + (ct.tasks?.reward_amount || 0) * 10, 0)
                      .toFixed(0) || '0'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Completed Tasks List */}
          <div className="space-y-3">
            {!completedTasks || completedTasks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No completed tasks yet. Start earning by completing tasks!
                  </p>
                  <a
                    href="/tasks"
                    className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                  >
                    Browse Available Tasks
                  </a>
                </CardContent>
              </Card>
            ) : (
              completedTasks.map((completion) => (
                <Card key={completion.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {completion.tasks?.title || 'Unknown Task'}
                          </h3>
                          <Badge
                            variant="outline"
                            className={
                              completion.tasks?.type === 'ad'
                                ? 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                                : 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            }
                          >
                            {completion.tasks?.type === 'ad' ? 'Ad Task' : 'Social Task'}
                          </Badge>
                        </div>
                        {completion.tasks?.description && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {completion.tasks.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm">
                          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${completion.tasks?.reward_amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {((completion.tasks?.reward_amount || 0) * 10).toFixed(0)} pts
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(completion.completed_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </ProtectedRoute>
  )
}
