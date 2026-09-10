'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Users } from 'lucide-react'

interface ReferralStatsCardProps {
  referralCode: string
  referralCount: number
}

export function ReferralStatsCard({ referralCode, referralCount }: ReferralStatsCardProps) {
  const [copied, setCopied] = useState(false)

  const referralLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/signup?ref=${referralCode}`
      : `https://yourdomain.com/signup?ref=${referralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Referral Program</CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {referralCount} {referralCount === 1 ? 'referral' : 'referrals'}
          </Badge>
        </div>
        <CardDescription>
          Earn $1 + 10 points when your referrals complete their first task
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Your Referral Code
          </label>
          <p className="mt-1 text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {referralCode}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Your Referral Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <Button onClick={handleCopy} variant="outline" className="shrink-0">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
          <p className="text-sm text-indigo-900 dark:text-indigo-200">
            💡 Share your link to invite friends. You'll earn rewards when they complete their first
            task!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
