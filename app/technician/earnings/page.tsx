'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Booking } from '@/lib/types'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { DollarSign } from 'lucide-react'

export default function EarningsPage() {
  const router = useRouter()
  const { user, technician, loading: authLoading } = useAuth()
  const [earnings, setEarnings] = useState<{ date: string; amount: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/technician')
      return
    }
    if (!authLoading && user && !technician) {
      router.push('/technician/setup')
      return
    }
    if (technician) fetchEarnings()
  }, [user, technician, authLoading, router, period])

  const fetchEarnings = async () => {
    setLoading(true)
    try {
      const now = new Date()
      let startDate: Date

      if (period === 'day') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      } else if (period === 'week') {
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - startDate.getDay())
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      }

      const { data } = await supabase
        .from('bookings')
        .select('completed_at, final_amount, service_price, parts_cost, service_charge')
        .eq('technician_id', technician?.id)
        .eq('status', 'completed')
        .gte('completed_at', startDate.toISOString())
        .order('completed_at', { ascending: false })

      const total = data?.reduce((sum, b) => sum + (b.final_amount || b.service_price), 0) || 0
      setEarnings(data?.map((b) => ({
        date: b.completed_at!,
        amount: b.final_amount || b.service_price,
      })) || [])
    } catch (error) {
      toast.error('Failed to load earnings')
    } finally {
      setLoading(false)
    }
  }

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0)

  return (
    <AppShell title="Earnings">
      <div className="p-4 space-y-4">
        {/* Total Earnings */}
        <Card className="p-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100">Total Earnings</p>
              <p className="text-3xl font-bold mt-1">₹{totalEarnings.toFixed(2)}</p>
            </div>
            <DollarSign className="h-12 w-12 text-emerald-200" />
          </div>
        </Card>

        {/* Period Tabs */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="day">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="mt-4 space-y-3">
            {earnings.length === 0 ? (
              <Card className="p-6 text-center text-gray-500">
                <p>No earnings for this period</p>
              </Card>
            ) : (
              earnings.map((e, i) => (
                <Card key={i} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Job completed</p>
                    <p className="text-xs text-gray-400">{format(new Date(e.date), 'dd MMM yyyy, hh:mm a')}</p>
                  </div>
                  <p className="text-lg font-bold text-emerald-600">+₹{e.amount}</p>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
