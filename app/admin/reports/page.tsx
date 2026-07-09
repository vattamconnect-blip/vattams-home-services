'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { format, subDays, subMonths } from 'date-fns'

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalCompleted: 0,
    totalCancelled: 0,
    avgBookingValue: 0,
    revenueData: [] as { date: string; amount: number }[],
    serviceStats: [] as { service: string; count: number }[],
  })

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const thirtyDaysAgo = subDays(new Date(), 30)

      // Total bookings and revenue
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('final_amount, service_price, status, service_name, created_at')

      const completed = allBookings?.filter(b => b.status === 'completed') || []
      const totalRevenue = completed.reduce((sum, b) => sum + (b.final_amount || b.service_price), 0)
      const avgValue = completed.length > 0 ? totalRevenue / completed.length : 0

      // Revenue by day (last 7 days)
      const revenueByDay: Record<string, number> = {}
      for (let i = 0; i < 7; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
        revenueByDay[date] = 0
      }

      const completedLastWeek = completed.filter(b => {
        const date = new Date(b.created_at)
        return date >= thirtyDaysAgo
      })

      completedLastWeek.forEach(b => {
        const date = format(new Date(b.created_at), 'yyyy-MM-dd')
        if (revenueByDay[date] !== undefined) {
          revenueByDay[date] += b.final_amount || b.service_price
        }
      })

      const revenueData = Object.entries(revenueByDay)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Service stats
      const serviceCounts: Record<string, number> = {}
      allBookings?.forEach(b => {
        serviceCounts[b.service_name] = (serviceCounts[b.service_name] || 0) + 1
      })

      const serviceStats = Object.entries(serviceCounts)
        .map(([service, count]) => ({ service, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setStats({
        totalRevenue,
        totalBookings: allBookings?.length || 0,
        totalCompleted: completed.length,
        totalCancelled: allBookings?.filter(b => b.status === 'cancelled').length || 0,
        avgBookingValue: avgValue,
        revenueData,
        serviceStats,
      })
    } catch (error) {
      toast.error('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalCompleted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Booking Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.avgBookingValue.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Service Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Top Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.serviceStats.map((s, i) => (
              <div key={s.service} className="flex items-center">
                <span className="w-6 text-gray-400">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{s.service}</span>
                    <span className="text-sm text-gray-500">{s.count} bookings</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${(s.count / Math.max(...stats.serviceStats.map(x => x.count), 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart (Simple) */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-40">
            {stats.revenueData.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-600 rounded-t"
                  style={{
                    height: `${Math.max((d.amount / Math.max(...stats.revenueData.map(x => x.amount), 1)) * 100, 4)}%`,
                  }}
                />
                <span className="text-xs text-gray-400 mt-1">{format(new Date(d.date), 'EEE')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
