'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Review } from '@/lib/types'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<(Review & { booking?: { booking_number: string; service_name: string } })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('reviews')
        .select('*, booking:bookings(booking_number, service_name)')
        .order('created_at', { ascending: false })

      setReviews(data || [])
    } catch (error) {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <span className="text-xl font-bold">{avgRating}</span>
          <span className="text-gray-500">({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {review.booking?.booking_number}
                  </span>
                </div>
                <p className="font-medium">{review.booking?.service_name}</p>
              </div>
              <span className="text-xs text-gray-400">
                {format(new Date(review.created_at), 'dd MMM yyyy')}
              </span>
            </div>
            {review.comment && (
              <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
            )}
          </Card>
        ))}

        {reviews.length === 0 && !loading && (
          <Card className="p-6 text-center text-gray-500">
            No reviews yet
          </Card>
        )}
      </div>
    </div>
  )
}
