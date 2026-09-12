import { ProtectedRoute } from '@/lib/auth/protected-route'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReferralStatsCard } from '@/components/referral-stats-card'
import { DailyCheckinButton } from '@/components/daily-checkin-button'
import { BottomNav } from '@/components/bottom-nav'
import { DollarSign, Trophy, Gift, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const userData = await getUser()

  if (!userData) {
    redirect('/login')
  }

  const { user, profile } = userData

  // Redirect admins to admin dashboard
  if (profile.role === 'admin') {
    redirect('/admin')
  }

  // Get referral count
  const supabase = await createClient()
  const { data: referrals, error } = await supabase
    .from('referrals')
    .select('id')
    .eq('referrer_id', user.id)

  const referralCount = referrals?.length || 0

  return (
    <ProtectedRoute requiredRole="user">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pb-20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Welcome back, {profile.email}
            </p>
          </div>

          {/* Wallet Warning Banner */}
          {!profile.wallet_address && (
            <Card className="mb-6 border-2 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                      Wallet Address Required
                    </h3>
                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                      Add your USDT wallet address to be eligible for payouts.
                    </p>
                    <Link
                      href="/settings"
                      className="mt-3 inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                    >
                      Add Wallet Address →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Stats */}
            <div className="space-y-6 lg:col-span-2">
              {/* USDT Balance - Large and Prominent */}
              <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 dark:border-indigo-800 dark:from-indigo-950 dark:to-purple-950">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-indigo-600 dark:text-indigo-400">
                      USDT Balance
                    </CardDescription>
                    <div className="rounded-full bg-indigo-100 p-2 dark:bg-indigo-900">
                      <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <CardTitle className="text-5xl font-bold text-indigo-900 dark:text-indigo-100">
                    ${profile.usdt_balance.toFixed(2)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
                    <TrendingUp className="h-4 w-4" />
                    <span>Available for withdrawal or tasks</span>
                  </div>
                </CardContent>
              </Card>

              {/* Points Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Points (This Round)</CardTitle>
                      <CardDescription>Earn points to unlock rewards</CardDescription>
                    </div>
                    <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
                      <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                      {profile.points}
                    </p>
                    <Badge variant="secondary">Points</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Check-in Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                      <Gift className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle>Daily Check-in</CardTitle>
                      <CardDescription>
                        Check in daily to earn $0.50 and 5 points
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <DailyCheckinButton lastCheckinAt={profile.last_checkin_at || null} />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Referral Stats */}
            <div className="space-y-6">
              <ReferralStatsCard referralCode={profile.referral_code} referralCount={referralCount} />

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Earned</span>
                    <span className="font-semibold">${profile.usdt_balance.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Points</span>
                    <span className="font-semibold">{profile.points} pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Referrals</span>
                    <span className="font-semibold">{referralCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account Status</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </ProtectedRoute>
  )
}
