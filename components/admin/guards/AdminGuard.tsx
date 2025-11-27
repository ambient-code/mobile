import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '@/services/auth/authContext'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      // Redirect non-admin users to main app
      router.replace('/(tabs)')
      // TODO: Show toast notification: "Admin access required"
    }
  }, [user, router])

  // Don't render admin content for non-admin users
  if (!user || user.role !== 'admin') {
    return null
  }

  return <>{children}</>
}
