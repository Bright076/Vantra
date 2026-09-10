import { ProtectedRoute } from '@/lib/auth/protected-route'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'

export default async function AdminPage() {
  const userData = await getUser()

  if (!userData) {
    redirect('/login')
  }

  const { profile } = userData

  // Redirect non-admins to user dashboard
  if (profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Welcome, {profile.email} (Administrator)
              </p>
            </div>
            <LogoutButton />
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Admin Panel
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Admin features will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
