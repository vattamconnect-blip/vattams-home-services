'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { Customer } from '@/lib/types'
import { toast } from 'sonner'
import { Search, Phone, MapPin } from 'lucide-react'
import { format } from 'date-fns'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [search])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
      }

      const { data } = await query
      setCustomers(data || [])
    } catch (error) {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {customers.map((customer) => (
          <Card key={customer.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Phone className="h-4 w-4" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span className="line-clamp-1">{customer.address || 'No address'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                  {customer.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <p className="text-xs text-gray-400 mt-2">
                  Joined {format(new Date(customer.created_at), 'dd MMM yyyy')}
                </p>
              </div>
            </div>
          </Card>
        ))}

        {customers.length === 0 && !loading && (
          <Card className="p-6 text-center text-gray-500">
            No customers found
          </Card>
        )}
      </div>
    </div>
  )
}
