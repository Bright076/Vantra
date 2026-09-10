'use client'

import { useState } from 'react'

interface ReferralLinkCardProps {
  referralCode: string
}

export function ReferralLinkCard({ referralCode }: ReferralLinkCardProps) {
  const [copied, setCopied] = useState(false)
  
  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/signup?ref=${referralCode}`
    : `[Your Domain]/signup?ref=${referralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-6 rounded-lg bg-indigo-50 p-6 dark:bg-indigo-900/20">
      <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-300">
        Your Referral Link
      </h3>
      <div className="mt-2 flex items-center gap-2">
        <code className="flex-1 overflow-x-auto rounded bg-white px-3 py-2 text-sm text-gray-900 dark:bg-gray-800 dark:text-gray-100">
          {referralLink}
        </code>
        <button
          onClick={handleCopy}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="mt-2 text-sm text-indigo-700 dark:text-indigo-300">
        Earn $1 + 10 points when someone signs up with your code and completes their first task!
      </p>
    </div>
  )
}
