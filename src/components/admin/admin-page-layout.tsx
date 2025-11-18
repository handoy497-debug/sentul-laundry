'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  LogOut, 
  Home,
  Package,
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  Database,
  Settings
} from 'lucide-react'

interface AdminPageLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  currentPage: string
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/admin/dashboard' },
  { id: 'orders', label: 'Pesanan', icon: Package, href: '/admin/dashboard?tab=orders' },
  { id: 'customers', label: 'Pelanggan', icon: Users, href: '/admin/dashboard?tab=customers' },
  { id: 'services', label: 'Layanan', icon: FileText, href: '/admin/dashboard?tab=services' },
  { id: 'payments', label: 'Pembayaran', icon: CreditCard, href: '/admin/dashboard?tab=payments' },
  { id: 'reports', label: 'Laporan', icon: TrendingUp, href: '/admin/reports' },
  { id: 'data-management', label: 'Manajemen Data', icon: Database, href: '/admin/data-management' },
  { id: 'settings', label: 'Pengaturan', icon: Settings, href: '/admin/dashboard?tab=settings' },
]

export default function AdminPageLayout({ children, title, description, currentPage }: AdminPageLayoutProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Package className="h-8 w-8 text-teal-600" />
            <h1 className="ml-2 text-xl font-bold text-teal-600">Sentul-Laundry</h1>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              )
            })}
          </nav>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/admin/dashboard')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Dashboard
                </Button>
                <div className="hidden lg:block">
                  <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                  {description && (
                    <p className="text-sm text-gray-600">{description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-teal-600">
                  Admin Panel
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 relative overflow-y-auto">
          {/* Mobile Title */}
          <div className="lg:hidden px-4 sm:px-6 lg:px-8 pt-6">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}