'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, ArrowLeft, CheckCircle2, AlertCircle, Wallet } from 'lucide-react'
import Link from 'next/link'

interface Winner {
  id: string
  round_id: string
  user_id: string
  rank: number
  balance_at_selection: number
  status: 'pending' | 'paid' | 'ineligible'
  ineligibility_reason: string | null
  paid_at: string | null
  user: {
    email: string
    username: string | null
    wallet_address: string | null
  }
  round: {
    withdrawal_date: string
  }
}

export default function AdminWithdrawalsPage() {
  const router = useRouter()
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchWinners()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/dashboard')
    }
  }

  const fetchWinners = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('withdrawal_winners')
        .select(`
          *,
          user:user_id (
            email,
            username,
            wallet_address
          ),
          round:round_id (
            withdrawal_date
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWinners(data as unknown as Winner[])
    } catch (err) {
      console.error('Error fetching winners:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsPaid = async (winner: Winner) => {
    if (!confirm(`Mark payout as complete for ${winner.user.email}?`)) return

    setProcessing(true)
    try {
      const supabase = createClient()

      // Deduct balance and mark as paid
      const { error: updateBalanceError } = await supabase
        .from('profiles')
        .update({
          usdt_balance: 0, // Deduct full balance
        })
        .eq('id', winner.user_id)

      if (updateBalanceError) throw updateBalanceError

      // Mark winner as paid
      const { error: updateWinnerError } = await supabase
        .from('withdrawal_winners')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', winner.id)

      if (updateWinnerError) throw updateWinnerError

      alert('Payout marked as complete!')
      await fetchWinners()
    } catch (err: any) {
      alert('Error processing payout: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Withdrawal Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Process payouts for withdrawal winners
              </p>
            </div>
          </div>
        </div>

        {/* Winners List */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Winners ({winners.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {winners.map((winner) => (
                <div
                  key={winner.id}
                  className="rounded-lg border-2 border-gray-200 p-6 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                          <span className="font-bold text-yellow-800 dark:text-yellow-200">
                            #{winner.rank}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {winner.user.username || winner.user.email}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {winner.user.email}
                          </p>
                        </div>
                      </div>

                      {/* Round Date */}
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <strong>Round Date:</strong>{' '}
                        {new Date(winner.round.withdrawal_date).toLocaleDateString()}
                      </div>

                      {/* Balance */}
                      <div className="mt-2 flex items-center gap-4">
                        <div className="rounded-lg bg-green-50 px-4 py-2 dark:bg-green-900/20">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Balance</div>
                          <div className="text-xl font-bold text-green-900 dark:text-green-100">
                            ${winner.balance_at_selection.toFixed(2)}
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          {winner.status === 'pending' && (
                            <Badge className="bg-yellow-600">Pending</Badge>
                          )}
                          {winner.status === 'paid' && (
                            <Badge className="bg-green-600">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Paid
                            </Badge>
                          )}
                          {winner.status === 'ineligible' && (
                            <Badge className="bg-red-600">Ineligible</Badge>
                          )}
                        </div>
                      </div>

                      {/* Wallet Address */}
                      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-start gap-2">
                          <Wallet className="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Wallet Address
                            </div>
                            {winner.user.wallet_address ? (
                              <div className="mt-1 break-all font-mono text-sm text-gray-900 dark:text-white">
                                {winner.user.wallet_address}
                              </div>
                            ) : (
                              <div className="mt-1 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                <AlertCircle className="h-4 w-4" />
                                <span className="font-semibold">NO WALLET ADDRESS SET</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Ineligibility Reason */}
                      {winner.ineligibility_reason && (
                        <div className="mt-3 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                          <p className="text-sm text-red-800 dark:text-red-200">
                            <strong>Ineligible:</strong> {winner.ineligibility_reason}
                          </p>
                        </div>
                      )}

                      {/* Paid Date */}
                      {winner.paid_at && (
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                          <strong>Paid on:</strong>{' '}
                          {new Date(winner.paid_at).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div>
                      {winner.status === 'pending' && winner.user.wallet_address && (
                        <Button
                          onClick={() => markAsPaid(winner)}
                          disabled={processing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {winners.length === 0 && (
                <div className="py-12 text-center text-gray-600 dark:text-gray-400">
                  No winners yet. Select winners from the Round Management page.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
