export type UserRole = 'user' | 'admin'
export type ReferralStatus = 'pending' | 'paid'
export type TaskType = 'ad' | 'social'
export type TaskCompletionStatus = 'pending' | 'verifying' | 'completed' | 'failed'

export interface Profile {
  id: string
  email: string
  role: UserRole
  usdt_balance: number
  points: number
  referral_code: string
  referred_by?: string | null
  last_checkin_at?: string | null
  wallet_address?: string | null
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  reward_amount: number
  status: ReferralStatus
  created_at: string
  paid_at?: string | null
}

export interface Task {
  id: string
  title: string
  description?: string | null
  type: TaskType
  reward_amount: number
  task_link: string
  ad_network_slot?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TaskCompletion {
  id: string
  task_id: string
  user_id: string
  status: TaskCompletionStatus
  started_at: string
  completed_at?: string | null
  reward_credited: boolean
  created_at: string
}
