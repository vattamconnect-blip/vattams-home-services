'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { Coupon } from '@/lib/types'
import { toast } from 'sonner'
import { Plus, Pencil, Percent, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '0',
    max_discount: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      setCoupons(data || [])
    } catch (error) {
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.code || !formData.discount_value) {
      toast.error('Please fill all required fields')
      return
    }

    const data = {
      code: formData.code.toUpperCase(),
      description: formData.description || null,
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_order_amount: parseFloat(formData.min_order_amount) || 0,
      max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    }

    let error
    if (editingCoupon) {
      const result = await supabase
        .from('coupons')
        .update(data)
        .eq('id', editingCoupon.id)
      error = result.error
    } else {
      const result = await supabase.from('coupons').insert(data)
      error = result.error
    }

    if (error) {
      toast.error('Failed to save coupon')
    } else {
      toast.success(editingCoupon ? 'Coupon updated' : 'Coupon created')
      setDialogOpen(false)
      setEditingCoupon(null)
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: '0',
        max_discount: '',
        usage_limit: '',
        start_date: '',
        end_date: '',
      })
      fetchCoupons()
    }
  }

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_amount: coupon.min_order_amount.toString(),
      max_discount: coupon.max_discount?.toString() || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      start_date: coupon.start_date?.split('T')[0] || '',
      end_date: coupon.end_date?.split('T')[0] || '',
    })
    setDialogOpen(true)
  }

  const toggleCoupon = async (coupon: Coupon) => {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id)

    if (error) {
      toast.error('Failed to update coupon')
    } else {
      toast.success(coupon.is_active ? 'Coupon deactivated' : 'Coupon activated')
      fetchCoupons()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingCoupon(null); setFormData({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0', max_discount: '', usage_limit: '', start_date: '', end_date: '' }) }}>
              <Plus className="h-4 w-4 mr-2" /> Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Coupon Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="SAVE20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select value={formData.discount_type} onValueChange={(v) => setFormData(p => ({ ...p, discount_type: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value *</Label>
                  <Input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData(p => ({ ...p, discount_value: e.target.value }))}
                    placeholder={formData.discount_type === 'percentage' ? '%' : '₹'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Order</Label>
                  <Input
                    type="number"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData(p => ({ ...p, min_order_amount: e.target.value }))}
                    placeholder="₹"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Discount</Label>
                  <Input
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData(p => ({ ...p, max_discount: e.target.value }))}
                    placeholder="₹"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Usage Limit</Label>
                <Input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData(p => ({ ...p, usage_limit: e.target.value }))}
                  placeholder="Unlimited"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(p => ({ ...p, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <Button className="w-full" onClick={handleSubmit}>
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg">{coupon.code}</h3>
                <p className="text-sm text-gray-500">{coupon.description || 'No description'}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => openEditDialog(coupon)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 my-3">
              {coupon.discount_type === 'percentage' ? (
                <Percent className="h-5 w-5 text-green-600" />
              ) : (
                <DollarSign className="h-5 w-5 text-green-600" />
              )}
              <span className="text-xl font-bold text-green-600">
                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
              </span>
              <span className="text-sm text-gray-500">OFF</span>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                {coupon.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-xs text-gray-400">{coupon.used_count} used</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
