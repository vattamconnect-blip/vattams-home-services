'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { Technician } from '@/lib/types'
import { toast } from 'sonner'
import { Search, Phone, MapPin, Star, Check, X, Ban } from 'lucide-react'
import { format } from 'date-fns'

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchTechnicians()
  }, [search])

  const fetchTechnicians = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('technicians')
        .select('*')
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
      }

      const { data } = await query
      setTechnicians(data || [])
    } catch (error) {
      toast.error('Failed to load technicians')
    } finally {
      setLoading(false)
    }
  }

  const approveTechnician = async (id: string) => {
    const { error } = await supabase
      .from('technicians')
      .update({ is_approved: true })
      .eq('id', id)

    if (error) {
      toast.error('Failed to approve technician')
    } else {
      toast.success('Technician approved')
      fetchTechnicians()
    }
  }

  const suspendTechnician = async (id: string, suspend: boolean) => {
    const { error } = await supabase
      .from('technicians')
      .update({ is_suspended: suspend })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update technician')
    } else {
      toast.success(suspend ? 'Technician suspended' : 'Technician activated')
      fetchTechnicians()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Technicians</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search technicians..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {technicians.map((tech) => (
          <Card key={tech.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">
                  {tech.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                    {!tech.is_approved && (
                      <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                    )}
                    {tech.is_suspended && (
                      <Badge className="bg-red-100 text-red-700">Suspended</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Phone className="h-4 w-4" />
                    <span>{tech.phone}</span>
                    <Star className="h-4 w-4 ml-2 text-yellow-500 fill-yellow-500" />
                    <span>{tech.rating.toFixed(1)}</span>
                    <span className="text-gray-400">({tech.total_jobs} jobs)</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span className="line-clamp-1">{tech.address || 'No address'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <p className="text-xs text-gray-400">
                  Joined {format(new Date(tech.created_at), 'dd MMM yyyy')}
                </p>
                <div className="flex gap-2">
                  {!tech.is_approved && (
                    <Button size="sm" variant="outline" onClick={() => approveTechnician(tech.id)}>
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  )}
                  {tech.is_approved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className={tech.is_suspended ? 'text-green-600' : 'text-red-600'}
                      onClick={() => suspendTechnician(tech.id, !tech.is_suspended)}
                    >
                      {tech.is_suspended ? (
                        <><Check className="h-4 w-4 mr-1" /> Activate</>
                      ) : (
                        <><Ban className="h-4 w-4 mr-1" /> Suspend</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {technicians.length === 0 && !loading && (
          <Card className="p-6 text-center text-gray-500">
            No technicians found
          </Card>
        )}
      </div>
    </div>
  )
}
