'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Booking } from '@/lib/types'
import { toast } from 'sonner'
import { Calendar, MapPin, Phone, MessageCircle, ChevronRight, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function JobsPage() {
  const router = useRouter()
  const { user, technician, loading: authLoading } = useAuth()
  const [jobs, setJobs] = useState<Booking[]>([])
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
    if (technician) fetchJobs()
  }, [user, technician, authLoading, router])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const today = format(new Date(), 'yyyy-MM-dd')

      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('technician_id', technician?.id)
        .or(`preferred_date.eq.${today},status.in.(assigned,technician_on_the_way,started)`)
        .order('preferred_date')
        .order('preferred_time')

      setJobs(data || [])
    } catch (error) {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const pendingJobs = jobs.filter((j) => j.status === 'assigned')
  const activeJobs = jobs.filter((j) => ['technician_on_the_way', 'started'].includes(j.status))
  const completedJobs = jobs.filter((j) => j.status === 'completed')

  return (
    <AppShell title="Today's Jobs">
      <Tabs defaultValue="pending" className="w-full">
        <div className="border-b bg-white sticky top-14 z-10">
          <TabsList className="w-full bg-transparent justify-start px-4 py-0 h-12">
            <TabsTrigger value="pending" className="data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none border-b-2 border-transparent px-4">
              Pending ({pendingJobs.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none border-b-2 border-transparent px-4">
              Active ({activeJobs.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none border-b-2 border-transparent px-4">
              Done ({completedJobs.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4">
          <TabsContent value="pending" className="space-y-3 mt-0">
            {pendingJobs.length === 0 ? (
              <EmptyState title="No Pending Jobs" description="New jobs will appear here" />
            ) : (
              pendingJobs.map((job) => (
                <JobCard key={job.id} job={job} onClick={() => router.push(`/technician/job/${job.id}`)} />
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-3 mt-0">
            {activeJobs.length === 0 ? (
              <EmptyState title="No Active Jobs" />
            ) : (
              activeJobs.map((job) => (
                <JobCard key={job.id} job={job} onClick={() => router.push(`/technician/job/${job.id}`)} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-0">
            {completedJobs.length === 0 ? (
              <EmptyState title="No Completed Jobs Yet" />
            ) : (
              completedJobs.map((job) => (
                <JobCard key={job.id} job={job} onClick={() => router.push(`/technician/job/${job.id}`)} />
              ))
            )}
          </TabsContent>
        </div>
      </Tabs>
    </AppShell>
  )
}

function JobCard({ job, onClick }: { job: Booking; onClick: () => void }) {
  return (
    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-gray-500">#{job.booking_number}</p>
          <h3 className="font-semibold text-gray-900">{job.service_name}</h3>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="space-y-1 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(job.preferred_date), 'dd MMM yyyy')}</span>
          <Clock className="h-4 w-4 ml-2" />
          <span>{job.preferred_time}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5" />
          <span className="line-clamp-1">{job.customer_address}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <span className="font-semibold text-emerald-600">₹{job.service_price}</span>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </Card>
  )
}
