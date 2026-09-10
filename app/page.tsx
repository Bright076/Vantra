import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'

export default async function Home() {
  const userData = await getUser()

  // If user is logged in, redirect to appropriate dashboard
  if (userData) {
    if (userData.profile.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/dashboard')
    }
  }

  // If not logged in, redirect to login page
  redirect('/login')
}
