'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { AppUser } from '@/types'

interface AuthContextType {
  user: User | null
  appUser: AppUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') {
      return null
    }

    try {
      return createClient()
    } catch {
      return null
    }
  }, [])

  const refreshSession = useCallback(async () => {
    if (!supabase) {
      setSession(null)
      setUser(null)
      setAppUser(null)
      setLoading(false)
      return
    }

    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    setSession(session)
    setUser(session?.user ?? null)

    if (session?.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setAppUser(userData ?? null)
    } else {
      setAppUser(null)
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (!supabase) {
      return
    }

    queueMicrotask(() => {
      void refreshSession()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void refreshSession()
    })

    return () => subscription.unsubscribe()
  }, [refreshSession, supabase])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client is not configured') }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client is not configured') }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    return { error }
  }

  const signOut = async () => {
    if (!supabase) {
      return
    }
    await supabase.auth.signOut()
    setUser(null)
    setAppUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, appUser, session, loading: supabase ? loading : false, signIn, signUp, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
