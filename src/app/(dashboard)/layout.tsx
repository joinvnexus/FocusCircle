'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Activity,
  Bell,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeft,
  Search,
  Settings,
  Shield,
  Target,
  Users,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { CommandPalette } from '@/components/shared/command-palette'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { dispatchQuickAction, openCommandPalette } from '@/lib/app-events'
import { cn, getInitials } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const SIDEBAR_STORAGE_KEY = 'focuscircle:sidebar-collapsed'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, appUser, loading, signOut, refreshSession } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  })

  const navigation = useMemo(
    () => [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, shortcut: ['g', 'd'] },
      { name: 'My Tasks', href: '/tasks', icon: CheckSquare, shortcut: ['g', 't'] },
      { name: 'Circles', href: '/circles', icon: Users, shortcut: ['g', 'c'] },
      { name: 'Goals', href: '/goals', icon: Target, shortcut: ['g', 'o'] },
      { name: 'Activity', href: '/activity', icon: Activity, shortcut: ['g', 'a'] },
      { name: 'Notifications', href: '/notifications', icon: Bell, shortcut: ['g', 'n'] },
      ...(appUser?.is_admin ? [{ name: 'Admin', href: '/admin', icon: Shield, shortcut: ['g', 'm'] as [string, string] }] : []),
    ],
    [appUser?.is_admin],
  )

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, router, user])

  useEffect(() => {
    const checkout = new URLSearchParams(window.location.search).get('checkout')
    if (!checkout) return

    if (checkout === 'success') {
      toast.success('Checkout complete. Activating Pro...')
    } else if (checkout === 'cancel') {
      toast.message('Checkout canceled.')
    }

    const url = new URL(window.location.href)
    url.searchParams.delete('checkout')
    window.history.replaceState(null, '', url.toString())

    void refreshSession()
  }, [pathname, refreshSession])

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    let sequence = ''

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      const key = event.key.toLowerCase()
      if (event.target instanceof HTMLElement) {
        const tagName = event.target.tagName
        const isTypingTarget =
          event.target.isContentEditable ||
          tagName === 'INPUT' ||
          tagName === 'TEXTAREA' ||
          tagName === 'SELECT'
        if (isTypingTarget) {
          return
        }
      }

      if (key === 'n') {
        sequence = 'n'
        window.setTimeout(() => {
          sequence = ''
        }, 900)
        return
      }

      if (sequence === 'n') {
        if (key === 't') {
          event.preventDefault()
          setSidebarOpen(false)
          router.push('/tasks')
          dispatchQuickAction('new-task')
        } else if (key === 'g') {
          event.preventDefault()
          setSidebarOpen(false)
          router.push('/goals')
          dispatchQuickAction('new-goal')
        } else if (key === 'c') {
          event.preventDefault()
          setSidebarOpen(false)
          router.push('/circles')
          dispatchQuickAction('new-circle')
        }
        sequence = ''
        return
      }

      if (key === 'g') {
        sequence = 'g'
        window.setTimeout(() => {
          sequence = ''
        }, 900)
        return
      }

      const match = navigation.find((item) => sequence === item.shortcut[0] && key === item.shortcut[1])
      if (match) {
        event.preventDefault()
        sequence = ''
        setSidebarOpen(false)
        router.push(match.href)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [navigation, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border-primary)] border-t-[var(--color-brand-primary)]" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading workspace...</p>
        </div>
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
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <CommandPalette />

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[var(--color-overlay)] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] transition-[width,transform] duration-300',
          sidebarCollapsed ? 'lg:w-[5.5rem]' : 'lg:w-72',
          sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72 lg:translate-x-0',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-border-primary)] px-4">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-brand-primary)] text-sm font-bold text-white shadow-[var(--shadow-sm)]">
              FC
            </div>
            <div className={cn('min-w-0 transition-opacity', sidebarCollapsed ? 'hidden lg:hidden' : 'block')}>
              <div className="truncate font-semibold">FocusCircle</div>
              <div className="truncate text-xs text-[var(--color-text-muted)]">Productivity workspace</div>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              onClick={() => setSidebarCollapsed((current) => !current)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="px-3 py-4">
          <Button
            variant="subtle"
            className={cn('h-11 w-full justify-start overflow-hidden', sidebarCollapsed ? 'lg:justify-center lg:px-0' : '')}
            onClick={openCommandPalette}
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className={cn(sidebarCollapsed ? 'lg:hidden' : 'inline')}>Search anything</span>
            <span className="ml-auto hidden rounded-full border border-[var(--color-border-primary)] px-2 py-1 text-[11px] text-[var(--color-text-muted)] lg:inline-flex">
              {sidebarCollapsed ? 'K' : 'Cmd K'}
            </span>
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-[var(--radius-lg)] px-3 py-3 text-sm font-medium transition',
                  sidebarCollapsed ? 'lg:justify-center lg:px-0' : '',
                  isActive
                    ? 'bg-[var(--color-brand-primary)] text-white shadow-[var(--shadow-sm)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]',
                )}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className={cn('truncate', sidebarCollapsed ? 'lg:hidden' : 'inline')}>{item.name}</span>
                <span className={cn('ml-auto text-[11px] uppercase tracking-[0.18em] opacity-70', sidebarCollapsed ? 'hidden' : 'inline')}>
                  {item.shortcut.join(' ')}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[var(--color-border-primary)] p-3">
          <div
            className={cn(
              'flex items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-3',
              sidebarCollapsed ? 'lg:justify-center' : '',
            )}
          >
            <Avatar className="h-10 w-10 shrink-0">
              {appUser?.avatar_url ? <AvatarImage src={appUser.avatar_url} alt={appUser.full_name || 'User avatar'} /> : null}
              <AvatarFallback className="bg-[var(--color-bg-surface-raised)] text-[var(--color-text-primary)]">
                {getInitials(appUser?.full_name || user.email || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className={cn('min-w-0 flex-1', sidebarCollapsed ? 'lg:hidden' : 'block')}>
              <p className="truncate text-sm font-medium">{appUser?.full_name || 'User'}</p>
              <p className="truncate text-xs text-[var(--color-text-muted)]">{user.email}</p>
            </div>
          </div>

          <div className="mt-2 space-y-1">
            <Button
              variant="ghost"
              className={cn('h-10 w-full justify-start', sidebarCollapsed ? 'lg:justify-center lg:px-0' : '')}
              asChild
            >
              <Link href="/profile" title="Settings">
                <Settings className="h-4 w-4 shrink-0" />
                <span className={cn(sidebarCollapsed ? 'lg:hidden' : 'inline')}>Settings</span>
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                'h-10 w-full justify-start text-[var(--color-text-secondary)] hover:text-[var(--color-error)]',
                sidebarCollapsed ? 'lg:justify-center lg:px-0' : '',
              )}
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className={cn(sidebarCollapsed ? 'lg:hidden' : 'inline')}>Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      <div className={cn('transition-[padding] duration-300', sidebarCollapsed ? 'lg:pl-[5.5rem]' : 'lg:pl-72')}>
        <header
          className="sticky top-0 z-30 border-b border-[var(--color-border-primary)] backdrop-blur"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-primary) 95%, transparent)' }}
        >
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              className="hidden h-11 w-full max-w-xl justify-start text-[var(--color-text-muted)] sm:flex"
              onClick={openCommandPalette}
            >
              <Search className="h-4 w-4" />
              <span>Search tasks, circles, goals, settings...</span>
              <kbd className="ml-auto hidden rounded-full border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] px-2 py-1 text-[11px] lg:inline-flex">
                Cmd K
              </kbd>
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="sm:hidden" onClick={openCommandPalette} aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:inline-flex"
                onClick={() => setSidebarCollapsed((current) => !current)}
                aria-label="Toggle sidebar"
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
