'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function QuickLogin() {
  const router = useRouter()

  useEffect(() => {
    // Auto-login for development
    const quickLogin = async () => {
      try {
        const response = await fetch('/api/admin/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'admin@laundrypro.com',
            password: 'admin123'
          }),
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.setItem('adminToken', data.token)
          router.push('/admin/dashboard')
        } else {
          router.push('/admin/login')
        }
      } catch (error) {
        router.push('/admin/login')
      }
    }

    quickLogin()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Quick login...</p>
      </div>
    </div>
  )
}