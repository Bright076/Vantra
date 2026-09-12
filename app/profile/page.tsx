import { ProtectedRoute } from '@/lib/auth/protected-route'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from '@/components/logout-button'
import { BottomNav } from '@/components/bottom-nav'
import { User, Mail, DollarSign, Trophy, Gift, Calendar } from 'lucide-react'

export default async function ProfilePage() {
  const userData = await getUser()

  if (!userData) {
    redirect('/login')
  }

  const { profile } = userData

  // Format date
  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <ProtectedRoute requiredRole="user">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pb-20">
        <div className="mx-auto max-w-2xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your account information
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-semibold">{profile.email}</p>
                    </div>
                  </div>
                </div>

                {profile.username && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Username</p>
                        <p className="font-semibold">{profile.username}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Referral Code</p>
                      <p className="font-mono font-semibold">{profile.referral_code}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                      <p className="font-semibold">{joinedDate}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="h-5 w-5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900/20">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-indigo-100 p-2 dark:bg-indigo-900">
                      <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">USDT Balance</p>
                      <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                        ${profile.usdt_balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900">
                      <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
                      <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                        {profile.points}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <LogoutButton />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <BottomNav />
    </ProtectedRoute>
  )
}
