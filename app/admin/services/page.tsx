'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Service, Category } from '@/lib/types'
import { toast } from 'sonner'
import { Plus, Pencil } from 'lucide-react'

export default function ServicesPage() {
  const [services, setServices] = useState<(Service & { category: Category })[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    base_price: '',
    duration_minutes: '60',
    is_popular: false,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: servicesData } = await supabase
        .from('services')
        .select('*, category:categories(*)')
        .order('name')

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)

      setServices(servicesData || [])
      setCategories(categoriesData || [])
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.category_id || !formData.base_price) {
      toast.error('Please fill all required fields')
      return
    }

    const data = {
      name: formData.name,
      description: formData.description || null,
      category_id: formData.category_id,
      base_price: parseFloat(formData.base_price),
      duration_minutes: parseInt(formData.duration_minutes) || 60,
      is_popular: formData.is_popular,
    }

    let error
    if (editingService) {
      const result = await supabase
        .from('services')
        .update(data)
        .eq('id', editingService.id)
      error = result.error
    } else {
      const result = await supabase.from('services').insert(data)
      error = result.error
    }

    if (error) {
      toast.error('Failed to save service')
    } else {
      toast.success(editingService ? 'Service updated' : 'Service created')
      setDialogOpen(false)
      setEditingService(null)
      setFormData({ name: '', description: '', category_id: '', base_price: '', duration_minutes: '60', is_popular: false })
      fetchData()
    }
  }

  const openEditDialog = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      category_id: service.category_id,
      base_price: service.base_price.toString(),
      duration_minutes: service.duration_minutes.toString(),
      is_popular: service.is_popular,
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Services</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingService(null); setFormData({ name: '', description: '', category_id: '', base_price: '', duration_minutes: '60', is_popular: false }) }}>
              <Plus className="h-4 w-4 mr-2" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Service Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Enter service name"
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category_id} onValueChange={(v) => setFormData(p => ({ ...p, category_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Base Price *</Label>
                  <Input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData(p => ({ ...p, base_price: e.target.value }))}
                    placeholder="₹"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (mins)</Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(p => ({ ...p, duration_minutes: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Service description"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="popular"
                  checked={formData.is_popular}
                  onChange={(e) => setFormData(p => ({ ...p, is_popular: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="popular">Mark as Popular</Label>
              </div>

              <Button className="w-full" onClick={handleSubmit}>
                {editingService ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{service.name}</h3>
                  {service.is_popular && <Badge variant="secondary">Popular</Badge>}
                </div>
                <Badge variant="outline" className="mt-1">{service.category?.name}</Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => openEditDialog(service)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{service.description || 'No description'}</p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div>
                <p className="text-xl font-bold text-blue-600">₹{service.base_price}</p>
                <p className="text-xs text-gray-500">{service.duration_minutes} mins</p>
              </div>
              <Badge variant={service.is_active ? 'default' : 'secondary'}>
                {service.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
