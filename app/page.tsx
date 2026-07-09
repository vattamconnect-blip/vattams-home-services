'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { User, Wrench, Shield } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  const apps = [
    {
      title: 'Customer App',
      description: 'Book home services instantly',
      icon: User,
      href: '/customer',
      color: 'from-blue-600 to-blue-700',
    },
    {
      title: 'Technician App',
      description: 'Manage your service jobs',
      icon: Wrench,
      href: '/technician',
      color: 'from-emerald-600 to-emerald-700',
    },
    {
      title: 'Admin Panel',
      description: 'Control panel for admins',
      icon: Shield,
      href: '/admin',
      color: 'from-slate-700 to-slate-800',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col">
      <div className="px-6 pt-16 pb-8 text-center text-white">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4">
          <Wrench className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold mb-2">VATTAMS</h1>
        <p className="text-blue-100">Home Services</p>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
          Choose your app
        </h2>
        <div className="space-y-4 max-w-md mx-auto">
          {apps.map((app) => (
            <Card
              key={app.href}
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow border-0 shadow"
              onClick={() => router.push(app.href)}
            >
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center`}>
                  <app.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{app.title}</h3>
                  <p className="text-sm text-gray-500">{app.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
