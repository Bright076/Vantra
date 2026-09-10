import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types/database'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  allowedRoles?: UserRole[]
}

/**
 * Protected route wrapper that:
 * - Redirects unauthenticated users to /login
 * - Redirects admins to /admin (unless specifically allowed)
 * - Redirects users to /dashboard if they try to access admin routes
 */
export async function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
}: ProtectedRouteProps) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile to check role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    redirect('/login')
  }

  // Check role-based access
  if (requiredRole && profile.role !== requiredRole) {
    // Redirect based on actual role
    if (profile.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/dashboard')
    }
  }

  // Check if role is in allowed roles list
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    if (profile.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/dashboard')
    }
  }

  // Special case: redirect admins to /admin unless they're explicitly on an admin route
  // This is handled by the layout components in each route

  return <>{children}</>
}
