'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Wrench,
  CalendarCheck,
  Settings,
  Tag,
  Megaphone,
  DollarSign,
  FileText,
  BarChart3,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AdminShellProps {
  children: React.ReactNode
  title?: string
}

const menuItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Technicians', href: '/admin/technicians', icon: Wrench },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Services', href: '/admin/services', icon: Settings },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Banners', href: '/admin/banners', icon: Megaphone },
  { label: 'Coupons', href: '/admin/coupons', icon: Tag },
  { label: 'Payments', href: '/admin/payments', icon: DollarSign },
  { label: 'Invoices', href: '/admin/invoices', icon: FileText },
  { label: 'Reviews', href: '/admin/reviews', icon: BarChart3 },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
]

export function AdminShell({ children, title }: AdminShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white border-r shadow-sm z-40 transition-transform duration-300',
          sidebarOpen ? 'w-64' : 'w-0 -translate-x-full'
        )}
      >
        <div className="h-14 border-b flex items-center justify-between px-4">
          <h1 className="font-bold text-lg text-blue-700">VATTAMS ADMIN</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="p-3 overflow-y-auto h-[calc(100vh-56px)]">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors text-left',
                pathname === item.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className={cn('flex-1 transition-all duration-300', sidebarOpen ? 'lg:ml-64' : 'ml-0')}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            {title && <h1 className="font-semibold text-lg">{title}</h1>}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
