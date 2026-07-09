'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { Category, Service } from '@/lib/types'
import { toast } from 'sonner'
import { ChevronRight } from 'lucide-react'

export default function CategoryServicesPage() {
  const params = useParams()
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategoryServices()
  }, [params.id])

  const fetchCategoryServices = async () => {
    setLoading(true)
    try {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('id', params.id)
        .single()

      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('category_id', params.id)
        .eq('is_active', true)
        .order('name')

      setCategory(categoryData)
      setServices(servicesData || [])
    } catch (error) {
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <AppShell title="Category"><div /></AppShell>

  return (
    <AppShell title={category?.name || 'Services'}>
      <div className="p-4 space-y-3">
        {services.map((service) => (
          <Card
            key={service.id}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/customer/service/${service.id}`)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                {service.description && (
                  <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-blue-600">₹{service.base_price}</span>
                  <span className="text-xs text-gray-500">• {service.duration_minutes} mins</span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/customer/book/${service.id}`)
                }}
              >
                Book
              </Button>
            </div>
          </Card>
        ))}

        {services.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No services available in this category
          </div>
        )}
      </div>
    </AppShell>
  )
}
