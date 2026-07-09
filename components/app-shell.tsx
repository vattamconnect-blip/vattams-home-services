'use client'

import { Bell, Menu, User, LogOut } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/lib/auth-context'
import { useState } from 'react'

interface AppShellProps {
  children: React.ReactNode
  title?: string
  headerContent?: React.ReactNode
  hideNav?: boolean
}

export function AppShell({ children, title, headerContent, hideNav }: AppShellProps) {
  const { user, customer, technician, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const profile = customer || technician
  const userName = profile?.name || 'User'

  const menuItems = customer ? [
    { label: 'Home', href: '/customer', icon: 'home' },
    { label: 'Bookings', href: '/customer/bookings', icon: 'calendar' },
    { label: 'Notifications', href: '/customer/notifications', icon: 'bell' },
    { label: 'Profile', href: '/customer/profile', icon: 'user' },
  ] : technician ? [
    { label: 'Dashboard', href: '/technician', icon: 'home' },
    { label: 'Today\'s Jobs', href: '/technician/jobs', icon: 'calendar' },
    { label: 'History', href: '/technician/history', icon: 'clock' },
    { label: 'Earnings', href: '/technician/earnings', icon: 'wallet' },
    { label: 'Profile', href: '/technician/profile', icon: 'user' },
  ] : []

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNav && (
        <header className="sticky top-0 z-50 bg-white border-b h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">{userName}</p>
                      <p className="text-sm text-blue-100">{profile?.phone}</p>
                    </div>
                  </div>
                </div>
                <nav className="p-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href)
                        setOpen(false)
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
                        pathname === item.href
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      signOut()
                      router.push('/')
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            {title && <h1 className="font-semibold text-lg">{title}</h1>}
          </div>
          <div className="flex items-center gap-2">
            {headerContent}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => router.push(customer ? '/customer/notifications' : '/technician/notifications')}
            >
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>
      )}
      <main className={!hideNav ? 'pb-16' : ''}>
        {children}
      </main>
    </div>
  )
}
