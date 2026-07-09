'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { Payment, Booking } from '@/lib/types'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<(Payment & { booking: Booking })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('payments')
        .select('*, booking:bookings(*)')
        .order('created_at', { ascending: false })

      setPayments(data || [])
    } catch (error) {
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-purple-100 text-purple-800',
  }

  const methodLabels = {
    cash: 'Cash',
    upi: 'UPI',
    card: 'Card',
    online: 'Online',
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Payment History</h1>

      <div className="grid gap-4">
        {payments.map((payment) => (
          <Card key={payment.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">#{payment.booking?.booking_number}</span>
                  <Badge className={statusColors[payment.payment_status]}>
                    {payment.payment_status}
                  </Badge>
                </div>
                <p className="font-semibold">{payment.booking?.service_name}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                  <span>via {methodLabels[payment.payment_method]}</span>
                  <span>{format(new Date(payment.created_at), 'dd MMM yyyy, hh:mm a')}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">₹{payment.amount}</p>
                {payment.transaction_id && (
                  <p className="text-xs text-gray-400 mt-1">TXN: {payment.transaction_id}</p>
                )}
              </div>
            </div>
          </Card>
        ))}

        {payments.length === 0 && !loading && (
          <Card className="p-6 text-center text-gray-500">
            No payments found
          </Card>
        )}
      </div>
    </div>
  )
}
