'use client'

import { Badge } from '@/components/ui/badge'
import { BookingStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: BookingStatus
}

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  assigned: { label: 'Assigned', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  technician_on_the_way: { label: 'On the Way', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  started: { label: 'In Progress', className: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  )
}
