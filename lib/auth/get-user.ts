import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types/database'

export async function getUser(): Promise<{ user: any; profile: Profile } | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) return null

  return { user, profile }
}
