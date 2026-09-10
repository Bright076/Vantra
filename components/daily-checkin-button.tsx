'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { processDailyCheckin } from '@/lib/actions/daily-checkin'
import { Gift, Clock, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DailyCheckinButtonProps {
  lastCheckinAt: string | null
}

export function DailyCheckinButton({ lastCheckinAt }: DailyCheckinButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [canCheckin, setCanCheckin] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  useEffect(() => {
    const checkEligibility = () => {
      if (!lastCheckinAt) {
        setCanCheckin(true)
        setTimeRemaining('')
        return
      }

      const now = new Date()
      const lastCheckin = new Date(lastCheckinAt)
      const nextCheckin = new Date(lastCheckin.getTime() + 24 * 60 * 60 * 1000)
      const timeDiff = nextCheckin.getTime() - now.getTime()

      if (timeDiff <= 0) {
        setCanCheckin(true)
        setTimeRemaining('')
      } else {
        setCanCheckin(false)
        const hours = Math.floor(timeDiff / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeRemaining(`${hours}h ${minutes}m`)
      }
    }

    checkEligibility()
    const interval = setInterval(checkEligibility, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [lastCheckinAt])

  const handleCheckin = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const result = await processDailyCheckin()

      if (result.success) {
        setMessage(result.message)
        // Refresh the page to show updated balance and points
        router.refresh()
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleCheckin}
        disabled={!canCheckin || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Clock className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : canCheckin ? (
          <>
            <Gift className="mr-2 h-5 w-5" />
            Daily Check-in (+$0.50, +5 pts)
          </>
        ) : (
          <>
            <Clock className="mr-2 h-5 w-5" />
            Next check-in in {timeRemaining}
          </>
        )}
      </Button>

      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.includes('successful')
              ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200'
              : 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
          }`}
        >
          <div className="flex items-center">
            {message.includes('successful') && <Check className="mr-2 h-4 w-4" />}
            {message}
          </div>
        </div>
      )}
    </div>
  )
}
