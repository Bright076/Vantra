import { ProtectedRoute } from '@/lib/auth/protected-route'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReferralLinkCard } from '@/components/referral-link-card'
import { BottomNav } from '@/components/bottom-nav'
import { Users, DollarSign, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

interface ReferralWithUser {
  id: string
  referrer_id: string
  referred_id: string
  reward_amount: number
  status: 'pending' | 'paid'
  created_at: string
  paid_at: string | null
  referred_user: {
    username: string | null
    email: string
  }
}

export default async function ReferralsPage() {
  const userData = await getUser()

  if (!userData) {
    redirect('/login')
  }

  const { user, profile } = userData
  const supabase = await createClient()

  // Fetch user's referrals with referred user info
  const { data: referrals, error } = await supabase
    .from('referrals')
    .select(`
      id,
      referrer_id,
      referred_id,
      reward_amount,
      status,
      created_at,
      paid_at,
      referred_user:referred_id (
        username,
        email
      )
    `)
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching referrals:', error)
  }

  const referralsList = (referrals || []) as unknown as ReferralWithUser[]

  // Calculate stats
  const paidCount = referralsList.filter(r => r.status === 'paid').length
  const pendingCount = referralsList.filter(r => r.status === 'pending').length
  const totalEarned = referralsList
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + Number(r.reward_amount), 0)

  // Mask email for privacy
  const maskEmail = (email: string) => {
    if (!email) return 'User***'
    const [username] = email.split('@')
    if (username.length <= 3) return username + '***'
    return username.substring(0, 3) + '***'
  }

  const getDisplayName = (referral: ReferralWithUser) => {
    if (referral.referred_user?.username) {
      return referral.referred_user.username
    }
    return maskEmail(referral.referred_user?.email || '')
  }

  return (
    <ProtectedRoute requiredRole="user">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pb-20">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Referrals</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Invite friends and earn rewards
            </p>
          </div>

          <div className="space-y-6">
            {/* Referral Link Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Referral Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ReferralLinkCard referralCode={profile.referral_code} />
                
                {/* Important Message */}
                <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-100">
                        How You Earn
                      </p>
                      <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                        You earn <strong>$1</strong> for every friend who signs up <strong>AND completes their first task</strong>. 
                        The reward is not paid just for signing up.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Earned</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${totalEarned.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                      <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {paidCount}
                      </p>
                    </div>
                    <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900">
                      <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {pendingCount}
                      </p>
                    </div>
                    <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
                      <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referrals List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Referrals ({referralsList.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {referralsList.length === 0 ? (
                  <div className="py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                      No referrals yet
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Share your referral link to start earning!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {referralsList.map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                            <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {getDisplayName(referral)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Joined {new Date(referral.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          {referral.status === 'paid' ? (
                            <>
                              <Badge className="bg-green-600">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Paid
                              </Badge>
                              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                ${referral.reward_amount.toFixed(2)} on{' '}
                                {new Date(referral.paid_at!).toLocaleDateString()}
                              </p>
                            </>
                          ) : (
                            <>
                              <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400">
                                <Clock className="mr-1 h-3 w-3" />
                                Pending
                              </Badge>
                              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                Waiting for first task
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <BottomNav />
    </ProtectedRoute>
  )
}
