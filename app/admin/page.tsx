import { ProtectedRoute } from '@/lib/auth/protected-route'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoutButton } from '@/components/logout-button'
import Link from 'next/link'
import { ListTodo, Calendar, Users, DollarSign, Bell } from 'lucide-react'

export default async function AdminPage() {
  const userData = await getUser()

  if (!userData) {
    redirect('/login')
  }

  const { profile } = userData

  // Redirect non-admins
  if (profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage tasks, withdrawals, and users
              </p>
            </div>
            <LogoutButton />
          </div>

          {/* Admin Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/tasks">
              <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                      <ListTodo className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle>Task Management</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create, edit, and delete tasks for users
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/withdrawals">
              <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                      <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle>Withdrawals</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage withdrawal rounds and process payouts
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/rounds">
              <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900">
                      <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <CardTitle>Round Management</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create new rounds and select winners
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/users">
              <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle>User Management</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and manage user accounts
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/notifications">
              <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900">
                      <Bell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <CardTitle>Notifications</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send notifications to users
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
