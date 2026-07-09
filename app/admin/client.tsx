'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Users, Wrench, CalendarCheck, DollarSign, TrendingUp, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalCustomers: number
  totalTechnicians: number
  activeBookings: number
  todayRevenue: number
  pendingBookings: number
  completedBookings: number
}

export default function AdminDashboardClient() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalTechnicians: 0,
    activeBookings: 0,
    todayRevenue: 0,
    pendingBookings: 0,
    completedBookings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const today = format(new Date(), 'yyyy-MM-dd')

      const { count: customers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

      const { count: technicians } = await supabase
        .from('technicians')
        .select('*', { count: 'exact', head: true })

      const { data: bookingsToday } = await supabase
        .from('bookings')
        .select('final_amount, service_price, status')
        .eq('preferred_date', today)

      const { count: pending } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      const { count: completed } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      const activeStatuses = ['assigned', 'technician_on_the_way', 'started']
      const { count: active } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .in('status', activeStatuses)

      const todayRevenue = bookingsToday?.reduce((sum, b) => {
        if (b.status === 'completed') {
          return sum + (b.final_amount || b.service_price)
        }
        return sum
      }, 0) || 0

      setStats({
        totalCustomers: customers || 0,
        totalTechnicians: technicians || 0,
        activeBookings: active || 0,
        todayRevenue,
        pendingBookings: pending || 0,
        completedBookings: completed || 0,
      })
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Technicians', value: stats.totalTechnicians, icon: Wrench, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Active Bookings', value: stats.activeBookings, icon: TrendingUp, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Today Revenue', value: `₹${stats.todayRevenue}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Pending', value: stats.pendingBookings, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Completed', value: stats.completedBookings, icon: CalendarCheck, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:border-blue-300" onClick={() => router.push('/admin/bookings')}>
          <CardContent className="p-4">
            <h3 className="font-semibold">View Bookings</h3>
            <p className="text-sm text-gray-500">Manage all bookings</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-emerald-300" onClick={() => router.push('/admin/technicians')}>
          <CardContent className="p-4">
            <h3 className="font-semibold">Technicians</h3>
            <p className="text-sm text-gray-500">Manage technicians</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-purple-300" onClick={() => router.push('/admin/services')}>
          <CardContent className="p-4">
            <h3 className="font-semibold">Services</h3>
            <p className="text-sm text-gray-500">Add/edit services</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-orange-300" onClick={() => router.push('/admin/reports')}>
          <CardContent className="p-4">
            <h3 className="font-semibold">Reports</h3>
            <p className="text-sm text-gray-500">View analytics</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
