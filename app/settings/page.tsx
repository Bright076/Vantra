'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/bottom-nav'
import { LogoutButton } from '@/components/logout-button'
import { Wallet, Save, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasWallet, setHasWallet] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      setWalletAddress(profile?.wallet_address || '')
      setHasWallet(!!profile?.wallet_address)
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(false)

    // Basic validation
    if (walletAddress && walletAddress.trim().length < 20) {
      setError('Please enter a valid USDT wallet address')
      return
    }

    setSaving(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_address: walletAddress.trim() || null })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess(true)
      setHasWallet(!!walletAddress.trim())

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error updating wallet:', err)
      setError(err.message || 'Failed to update wallet address')
    } finally {
      setSaving(false)
    }
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
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Wallet Address Warning Banner */}
          {!hasWallet && (
            <Card className="border-2 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                      Wallet Address Required
                    </h3>
                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                      Add your USDT wallet address to be eligible for payouts. Without a wallet address, 
                      you cannot withdraw your earnings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wallet Address Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                USDT Wallet Address
              </CardTitle>
              <CardDescription>
                Enter your USDT (TRC20) wallet address for receiving payouts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="wallet" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Wallet Address
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Wallet className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="wallet"
                    name="wallet"
                    type="text"
                    className="block w-full rounded-lg border-0 py-3 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 sm:text-sm sm:leading-6"
                    placeholder="Enter your USDT (TRC20) wallet address"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Make sure to enter a valid TRC20 USDT wallet address. Incorrect addresses may result in loss of funds.
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Wallet address updated successfully!
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Wallet Address
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600" />
                <p>Only TRC20 USDT addresses are supported</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600" />
                <p>Double-check your wallet address before saving</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600" />
                <p>Payouts are processed manually and may take 1-3 business days</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600" />
                <p>You can update your wallet address at any time</p>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <LogoutButton />
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
