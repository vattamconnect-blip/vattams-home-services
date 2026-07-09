'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { Service, Category } from '@/lib/types'
import { toast } from 'sonner'
import { Clock, Info } from 'lucide-react'

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [service, setService] = useState<(Service & { category: Category }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchService()
  }, [params.id])

  const fetchService = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('services')
        .select('*, category:categories(*)')
        .eq('id', params.id)
        .single()

      setService(data)
    } catch (error) {
      toast.error('Failed to load service')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <AppShell title="Service"><div /></AppShell>

  if (!service) {
    return (
      <AppShell title="Service">
        <div className="p-4 text-center text-gray-500">Service not found</div>
      </AppShell>
    )
  }

  return (
    <AppShell title={service.name}>
      <div className="p-4 space-y-4">
        {/* Service Info */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              {service.is_popular && (
                <Badge className="bg-orange-100 text-orange-700 mb-2">Popular</Badge>
              )}
              <Badge variant="outline">{service.category?.name}</Badge>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">₹{service.base_price}</p>
            </div>
          </div>

          {service.description && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{service.duration_minutes} mins</span>
            </div>
          </div>
        </Card>

        {/* What's Included */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">What&apos;s Included</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Professional inspection and diagnosis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Quality service by certified technician</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>30-day service warranty</span>
            </li>
          </ul>
        </Card>

        {/* Price Note */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Final price may vary based on parts required and service complexity.
            Technician will provide final quote after inspection.
          </p>
        </Card>

        {/* Book Button */}
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
          <Button
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push(`/customer/book/${service.id}`)}
          >
            Book Service • ₹{service.base_price}
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
