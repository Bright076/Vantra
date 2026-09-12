'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ListTodo, Trophy, User } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: ListTodo,
    },
    {
      name: 'Leaderboard',
      href: '/leaderboard',
      icon: Trophy,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 px-3 py-3 transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-xs font-medium">{item.name}</span>
                {isActive && (
                  <div className="absolute bottom-0 h-1 w-12 rounded-t-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
