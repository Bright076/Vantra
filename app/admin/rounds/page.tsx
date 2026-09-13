'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowLeft, Trophy, RotateCcw } from 'lucide-react'
import Link from 'next/link'

interface Round {
  id: string
  withdrawal_date: string
  is_active: boolean
  created_at: string
}

export default function AdminRoundsPage() {
  const router = useRouter()
  const [rounds, setRounds] = useState<Round[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [withdrawalDate, setWithdrawalDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    fetchRounds()
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

  const fetchRounds = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('withdrawal_rounds')
        .select('*')
        .order('withdrawal_date', { ascending: false })

      if (error) throw error
      setRounds(data || [])
    } catch (err) {
      console.error('Error fetching rounds:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const supabase = createClient()

      // Create new round
      const { error } = await supabase
        .from('withdrawal_rounds')
        .insert({
          withdrawal_date: withdrawalDate,
          is_active: true,
        })

      if (error) throw error

      setShowForm(false)
      setWithdrawalDate('')
      await fetchRounds()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const selectWinners = async (roundId: string) => {
    if (!confirm('Select top 5 users by points as winners for this round?')) return

    setProcessing(true)
    try {
      const supabase = createClient()

      // Get top 5 users by points (exclude admins)
      const { data: topUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, usdt_balance, points')
        .eq('role', 'user')
        .order('points', { ascending: false })
        .limit(5)

      if (usersError) throw usersError

      // Insert winners
      const winners = topUsers?.map((user, index) => ({
        round_id: roundId,
        user_id: user.id,
        rank: index + 1,
        balance_at_selection: user.usdt_balance,
        status: user.usdt_balance >= 100 ? 'pending' : 'ineligible',
        ineligibility_reason: user.usdt_balance < 100 ? 'Balance under $100' : null,
      }))

      const { error: winnersError } = await supabase
        .from('withdrawal_winners')
        .insert(winners)

      if (winnersError) throw winnersError

      alert('Winners selected successfully!')
      router.push('/admin/withdrawals')
    } catch (err: any) {
      alert('Error selecting winners: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  const startNewRound = async () => {
    if (!confirm('This will reset ALL user points to 0 and create a new round. Are you sure?')) return

    setProcessing(true)
    try {
      const supabase = createClient()

      // Reset all user points to 0
      const { error: resetError } = await supabase
        .from('profiles')
        .update({ points: 0 })
        .neq('id', '00000000-0000-0000-0000-000000000000') // Update all

      if (resetError) throw resetError

      // Deactivate all active rounds
      const { error: deactivateError } = await supabase
        .from('withdrawal_rounds')
        .update({ is_active: false })
        .eq('is_active', true)

      if (deactivateError) throw deactivateError

      // Create new round 30 days from now
      const newDate = new Date()
      newDate.setDate(newDate.getDate() + 30)

      const { error: createError } = await supabase
        .from('withdrawal_rounds')
        .insert({
          withdrawal_date: newDate.toISOString(),
          is_active: true,
        })

      if (createError) throw createError

      alert('New round started! All points reset to 0.')
      await fetchRounds()
    } catch (err: any) {
      alert('Error starting new round: ' + err.message)
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Round Management</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Create rounds and select winners
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={startNewRound} disabled={processing} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Start New Round
            </Button>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Calendar className="mr-2 h-4 w-4" />
                Create Round
              </Button>
            )}
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Withdrawal Round</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRound} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Withdrawal Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="mt-1 block w-full rounded-lg border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                    value={withdrawalDate}
                    onChange={(e) => setWithdrawalDate(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Creating...' : 'Create Round'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Rounds List */}
        <Card>
          <CardHeader>
            <CardTitle>All Rounds ({rounds.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rounds.map((round) => (
                <div
                  key={round.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {new Date(round.withdrawal_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </h3>
                      {round.is_active && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Created {new Date(round.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <Button
                    onClick={() => selectWinners(round.id)}
                    disabled={processing}
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Select Winners
                  </Button>
                </div>
              ))}

              {rounds.length === 0 && (
                <div className="py-12 text-center text-gray-600 dark:text-gray-400">
                  No rounds yet. Create one to get started!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
