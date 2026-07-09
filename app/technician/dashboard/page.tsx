'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Booking } from '@/lib/types'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Calendar, MapPin, Clock, Star, DollarSign, CheckCircle, Home } from 'lucide-react'

export default function TechnicianDashboard() {
  const router = useRouter()
  const { user, technician, refreshProfile, loading: authLoading } = useAuth()
  const [todayJobs, setTodayJobs] = useState<Booking[]>([])
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/technician')
      return
    }
    if (!authLoading && user && !technician) {
      router.push('/technician/setup')
      return
    }
    if (technician) {
      fetchData()
    }
  }, [user, technician, authLoading, router])

  const fetchData = async () => {
    setLoading(true)
    const today = format(new Date(), 'yyyy-MM-dd')

    try {
      // Today's jobs
      const { data: jobs } = await supabase
        .from('bookings')
        .select('*')
        .eq('technician_id', technician?.id)
        .eq('preferred_date', today)
        .order('preferred_time')

      // Stats
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      const startOfMonth = new Date()
      startOfMonth.setDate(1)

      const { data: weekJobs } = await supabase
        .from('bookings')
        .select('final_amount')
        .eq('technician_id', technician?.id)
        .eq('status', 'completed')
        .gte('completed_at', startOfWeek.toISOString())

      const { data: monthJobs } = await supabase
        .from('bookings')
        .select('final_amount')
        .eq('technician_id', technician?.id)
        .eq('status', 'completed')
        .gte('completed_at', startOfMonth.toISOString())

      setTodayJobs(jobs || [])
      setStats({
        today: jobs?.filter((j) => j.status === 'completed').length || 0,
        week: weekJobs?.length || 0,
        month: monthJobs?.length || 0,
      })
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const toggleOnline = async (checked: boolean) => {
    const { error } = await supabase
      .from('technicians')
      .update({ is_online: checked })
      .eq('id', technician?.id)

    if (error) {
      toast.error('Failed to update status')
    } else {
      await refreshProfile()
      toast.success(checked ? 'You are now online' : 'You are now offline')
    }
  }

  if (!technician?.is_approved) {
    return (
      <AppShell title="Dashboard">
        <div className="p-4">
          <Card className="p-6 text-center">
            <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Awaiting Approval</h2>
            <p className="text-sm text-gray-600">
              Your profile is under review. You will be notified once approved.
            </p>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Dashboard">
      <div className="p-4 space-y-4">
        {/* Online Toggle */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${technician?.is_online ? 'bg-green-500' : 'bg-gray-300'}`} />
              <Label htmlFor="online" className="font-semibold">
                {technician?.is_online ? 'Online' : 'Offline'}
              </Label>
            </div>
            <Switch
              id="online"
              checked={technician?.is_online || false}
              onCheckedChange={toggleOnline}
            />
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
            <p className="text-xs text-gray-500">Today</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.week}</p>
            <p className="text-xs text-gray-500">This Week</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.month}</p>
            <p className="text-xs text-gray-500">This Month</p>
          </Card>
        </div>

        {/* Earnings Card */}
        <Card className="p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Earnings</p>
              <p className="text-3xl font-bold mt-1">₹{technician?.total_earnings?.toFixed(2) || '0'}</p>
            </div>
            <DollarSign className="h-12 w-12 text-emerald-200" />
          </div>
        </Card>

        {/* Today's Jobs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Today&apos;s Jobs</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/technician/jobs')}
              className="text-emerald-600"
            >
              View All
            </Button>
          </div>

          {todayJobs.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              <p>No jobs scheduled for today</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayJobs.slice(0, 3).map((job) => (
                <Card
                  key={job.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/technician/job/${job.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{job.service_name}</h3>
                      <p className="text-xs text-gray-500">#{job.booking_number}</p>
                    </div>
                    <Badge className={job.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{job.preferred_time}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Rating Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Your Rating</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-xl font-bold">{technician?.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-sm text-gray-500">({technician?.total_jobs} jobs)</span>
              </div>
            </div>
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t safe-bottom">
        <div className="flex justify-around py-2">
          <button className="flex flex-col items-center px-4 py-2 text-emerald-600">
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button
            onClick={() => router.push('/technician/jobs')}
            className="flex flex-col items-center px-4 py-2 text-gray-500"
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Jobs</span>
          </button>
          <button
            onClick={() => router.push('/technician/earnings')}
            className="flex flex-col items-center px-4 py-2 text-gray-500"
          >
            <DollarSign className="h-5 w-5" />
            <span className="text-xs mt-1">Earnings</span>
          </button>
          <button
            onClick={() => router.push('/technician/profile')}
            className="flex flex-col items-center px-4 py-2 text-gray-500"
          >
            <div className="h-5 w-5 rounded-full bg-gray-300" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </AppShell>
  )
}
