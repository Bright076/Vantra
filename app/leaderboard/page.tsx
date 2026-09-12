'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BottomNav } from '@/components/bottom-nav'

interface LeaderboardEntry {
  id: string
  username: string | null
  points: number
  rank: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      // Fetch top 10 users by points
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, email, points')
        .order('points', { ascending: false })
        .limit(10)

      if (error) throw error

      // Add rank and mask username
      const leaderboardData: LeaderboardEntry[] = (data || []).map((entry, index) => ({
        id: entry.id,
        username: entry.username || maskEmail(entry.email),
        points: entry.points,
        rank: index + 1,
      }))

      setLeaderboard(leaderboardData)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mask email for privacy (show first 3 chars + ***)
  const maskEmail = (email: string) => {
    if (!email) return 'User***'
    const [username] = email.split('@')
    if (username.length <= 3) return username + '***'
    return username.substring(0, 3) + '***'
  }

  useEffect(() => {
    fetchLeaderboard()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000)

    return () => clearInterval(interval)
  }, [])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />
    return <TrendingUp className="h-5 w-5 text-gray-400" />
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  }

  const getRankBorder = (rank: number) => {
    if (rank === 1) return 'border-2 border-yellow-400 shadow-lg shadow-yellow-400/20'
    if (rank === 2) return 'border-2 border-gray-400 shadow-lg shadow-gray-400/20'
    if (rank === 3) return 'border-2 border-amber-500 shadow-lg shadow-amber-500/20'
    return 'border border-gray-200 dark:border-gray-700'
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-24">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Trophy className="h-10 w-10 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Leaderboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Top performers this round • Updates every 30 seconds
          </p>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <Card
              key={entry.id}
              className={`transition-all hover:scale-[1.02] ${getRankBorder(entry.rank)} ${
                entry.id === currentUserId ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Rank & Icon */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${getRankBadgeColor(
                        entry.rank
                      )}`}
                    >
                      <span className="text-lg font-bold">#{entry.rank}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank)}
                      <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {entry.username}
                          {entry.id === currentUserId && (
                            <Badge className="ml-2 bg-indigo-600">You</Badge>
                          )}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {entry.points.toLocaleString()} points
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Points Badge */}
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className="text-lg font-bold px-4 py-2"
                    >
                      {entry.points.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {leaderboard.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                No rankings yet
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Be the first to complete tasks and earn points!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <Card className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                🏆 Compete for the top spot!
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Complete tasks, check in daily, and refer friends to climb the leaderboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  )
}
