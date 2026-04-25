'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { cn, getInitials } from '@/lib/utils'
import {
  Activity,
  Bell,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Target,
  Users,
  X,
  Search,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { CommandPalette } from '@/components/shared/command-palette'
import { toast } from 'sonner'

export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, appUser, loading, signOut, refreshSession } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Circles', href: '/circles', icon: Users },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Activity', href: '/activity', icon: Activity },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    ...(appUser?.is_admin ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
  ]

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, router, user])

  useEffect(() => {
    const checkout = new URLSearchParams(window.location.search).get('checkout')
    if (!checkout) return

    if (checkout === 'success') {
      toast.success('Checkout complete. Activating Pro…')
    } else if (checkout === 'cancel') {
      toast.message('Checkout canceled.')
    }

    const url = new URL(window.location.href)
    url.searchParams.delete('checkout')
    window.history.replaceState(null, '', url.toString())

    void refreshSession()
  }, [pathname, refreshSession])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-b-2" style={{ borderBottomColor: 'var(--color-brand-primary)' }} />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
      <CommandPalette />
      
      {/* Sidebar backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300',
          'w-64',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-primary)' }}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4" style={{ borderColor: 'var(--color-border-primary)' }}>
          <Link href="/dashboard" className={cn('flex items-center space-x-2')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--color-brand-primary)' }}>
              <span className="text-white font-bold text-lg">FC</span>
            </div>
            <div>
              <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>FocusCircle</div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Productivity workspace</div>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(false)}
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-white'
                    : 'hover:text-[var(--color-text-primary)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)]'
                )}
                style={isActive ? { backgroundColor: 'var(--color-brand-primary)' } : {}}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-3 space-y-2" style={{ borderColor: 'var(--color-border-primary)' }}>
          <div className="flex items-center gap-2 rounded-lg p-2" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
            <Avatar className="h-8 w-8">
              {appUser?.avatar_url ? (
                <AvatarImage src={appUser.avatar_url} alt={appUser.full_name || 'User avatar'} />
              ) : null}
              <AvatarFallback style={{ backgroundColor: 'var(--color-bg-surface-raised)', color: 'var(--color-text-primary)' }}>
                {getInitials(appUser?.full_name || user.email || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                {appUser?.full_name || 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                {user.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
            asChild
          >
            <Link href="/profile">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-error)]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 transition-[padding] duration-300">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-4 lg:px-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-primary)' }}>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Command palette trigger */}
          <Button
            variant="outline"
            className="hidden w-full max-w-md justify-start gap-2 text-[var(--color-text-muted)] sm:flex"
            onClick={() => {}}
          >
            <Search className="h-4 w-4" />
            <span>Search tasks, circles, settings...</span>
            <kbd className="ml-auto hidden rounded border bg-[var(--color-bg-surface)] px-2 py-1 text-xs lg:inline-flex">
              ⌘K
            </kbd>
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <Link href="/notifications">
              <Button variant="ghost" size="icon" style={{ color: 'var(--color-text-muted)' }}>
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}