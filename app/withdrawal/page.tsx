'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BottomNav } from '@/components/bottom-nav'
import { Clock, Trophy, DollarSign, AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react'

interface WithdrawalRound {
  id: string
  withdrawal_date: string
  is_active: boolean
}

interface WithdrawalWinner {
  id: string
  round_id: string
  user_id: string
  rank: number
  balance_at_selection: number
  status: 'pending' | 'paid' | 'ineligible'
  ineligibility_reason: string | null
  paid_at: string | null
}

export default function WithdrawalPage() {
  const [loading, setLoading] = useState(true)
  const [activeRound, setActiveRound] = useState<WithdrawalRound | null>(null)
  const [userWinner, setUserWinner] = useState<WithdrawalWinner | null>(null)
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (activeRound) {
      updateCountdown()
      const interval = setInterval(updateCountdown, 1000)
      return () => clearInterval(interval)
    }
  }, [activeRound])

  const fetchData = async () => {
    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get active round
      const { data: round, error: roundError } = await supabase
        .from('withdrawal_rounds')
        .select('*')
        .eq('is_active', true)
        .order('withdrawal_date', { ascending: true })
        .limit(1)
        .single()

      if (roundError) {
        console.error('Error fetching round:', roundError)
      } else {
        setActiveRound(round)

        // Check if user is a winner in this round
        if (round) {
          const { data: winner, error: winnerError } = await supabase
            .from('withdrawal_winners')
            .select('*')
            .eq('round_id', round.id)
            .eq('user_id', user.id)
            .single()

          if (!winnerError && winner) {
            setUserWinner(winner)
          }
        }
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateCountdown = () => {
    if (!activeRound) return

    const now = new Date().getTime()
    const target = new Date(activeRound.withdrawal_date).getTime()
    const distance = target - now

    if (distance < 0) {
      setCountdown('Withdrawal date has passed')
      return
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24))
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((distance % (1000 * 60)) / 1000)

    setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pb-20">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Withdrawals</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Next withdrawal round information
          </p>
        </div>

        <div className="space-y-6">
          {/* Countdown Card */}
          {activeRound ? (
            <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 dark:border-indigo-800 dark:from-indigo-950 dark:to-purple-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  Next Withdrawal Date
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled Date</p>
                  <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                    {formatDate(activeRound.withdrawal_date)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time Remaining</p>
                  <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                    {countdown}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  No Active Round
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  The next withdrawal round hasn't been scheduled yet.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Info className="h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    How Withdrawals Work
                  </h3>
                  <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
                    Withdrawal winners are selected from the <strong>top 5 earners on the leaderboard</strong> each round. 
                    Winners must have a balance of at least <strong>$100</strong> to be eligible for payout.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Winner Status */}
          {userWinner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Your Winner Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 p-4 dark:from-yellow-900/20 dark:to-amber-900/20">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your Rank</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      #{userWinner.rank}
                    </p>
                  </div>
                  <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
                    <Trophy className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Balance at Selection</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ${userWinner.balance_at_selection.toFixed(2)}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Status</p>
                  {userWinner.status === 'pending' && (
                    <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                        <div>
                          <Badge className="mb-2 bg-yellow-600">Pending</Badge>
                          <p className="text-sm text-yellow-900 dark:text-yellow-100">
                            Balance: <strong>${userWinner.balance_at_selection.toFixed(2)}</strong> — awaiting payout
                          </p>
                          <p className="mt-1 text-xs text-yellow-800 dark:text-yellow-200">
                            Your withdrawal will be processed on the scheduled date.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {userWinner.status === 'paid' && (
                    <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <div>
                          <Badge className="mb-2 bg-green-600">Paid</Badge>
                          <p className="text-sm text-green-900 dark:text-green-100">
                            Withdrawal of <strong>${userWinner.balance_at_selection.toFixed(2)}</strong> has been processed!
                          </p>
                          {userWinner.paid_at && (
                            <p className="mt-1 text-xs text-green-800 dark:text-green-200">
                              Paid on {formatDate(userWinner.paid_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {userWinner.status === 'ineligible' && (
                    <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                        <div>
                          <Badge className="mb-2 bg-red-600">Ineligible</Badge>
                          <p className="text-sm text-red-900 dark:text-red-100">
                            {userWinner.ineligibility_reason || 'Balance under $100'}
                          </p>
                          <p className="mt-1 text-xs text-red-800 dark:text-red-200">
                            Keep earning to be eligible for the next round!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Not a Winner Message */}
          {!userWinner && activeRound && (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Not in This Round
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  You're not in the top 5 for this withdrawal round. Keep completing tasks and climbing the leaderboard!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips to Get Selected</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600" />
                <p>Complete tasks daily to increase your earnings</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600" />
                <p>Check in daily for bonus USDT and points</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600" />
                <p>Refer friends to earn $1 per successful referral</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600" />
                <p>Maintain a balance of at least $100 to be eligible</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600" />
                <p>Make sure your wallet address is set in Settings</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
