'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  username: string | null
  role: string
  usdt_balance: number
  points: number
  wallet_address: string | null
  referral_code: string
  created_at: string
  referral_count?: number
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    checkAuth()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.referral_code.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

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

  const fetchUsers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get referral counts for each user
      const usersWithCounts = await Promise.all(
        (data || []).map(async (user) => {
          const { count } = await supabase
            .from('referrals')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_id', user.id)

          return {
            ...user,
            referral_count: count || 0,
          }
        })
      )

      setUsers(usersWithCounts)
      setFilteredUsers(usersWithCounts)
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
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
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                View and manage all users
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border-0 py-3 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
              placeholder="Search by email, username, or referral code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      User
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Balance
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Points
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Referrals
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Joined
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Wallet
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="py-4">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {user.username || 'No username'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {user.email}
                          </div>
                          <div className="mt-1 text-xs text-gray-500 font-mono">
                            {user.referral_code}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-gray-900 dark:text-white">
                        ${user.usdt_balance.toFixed(2)}
                      </td>
                      <td className="py-4 text-gray-900 dark:text-white">
                        {user.points}
                      </td>
                      <td className="py-4 text-gray-900 dark:text-white">
                        {user.referral_count || 0}
                      </td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        {user.wallet_address ? (
                          <Badge variant="outline" className="font-mono text-xs">
                            {user.wallet_address.substring(0, 8)}...
                          </Badge>
                        ) : (
                          <span className="text-sm text-red-600 dark:text-red-400">
                            Not set
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                          {user.role}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="py-12 text-center text-gray-600 dark:text-gray-400">
                  {searchQuery ? 'No users found matching your search.' : 'No users yet.'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
