'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { Banner } from '@/lib/types'
import { toast } from 'sonner'
import { Plus, Pencil, Image } from 'lucide-react'

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_type: '',
    link_value: '',
    display_order: '0',
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .order('display_order')

      setBanners(data || [])
    } catch (error) {
      toast.error('Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.image_url) {
      toast.error('Please fill required fields')
      return
    }

    const data = {
      title: formData.title,
      subtitle: formData.subtitle || null,
      image_url: formData.image_url,
      link_type: formData.link_type || null,
      link_value: formData.link_value || null,
      display_order: parseInt(formData.display_order) || 0,
    }

    let error
    if (editingBanner) {
      const result = await supabase
        .from('banners')
        .update(data)
        .eq('id', editingBanner.id)
      error = result.error
    } else {
      const result = await supabase.from('banners').insert(data)
      error = result.error
    }

    if (error) {
      toast.error('Failed to save banner')
    } else {
      toast.success(editingBanner ? 'Banner updated' : 'Banner created')
      setDialogOpen(false)
      setEditingBanner(null)
      setFormData({ title: '', subtitle: '', image_url: '', link_type: '', link_value: '', display_order: '0' })
      fetchBanners()
    }
  }

  const toggleBanner = async (banner: Banner) => {
    const { error } = await supabase
      .from('banners')
      .update({ is_active: !banner.is_active })
      .eq('id', banner.id)

    if (error) {
      toast.error('Failed to update banner')
    } else {
      fetchBanners()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingBanner(null); setFormData({ title: '', subtitle: '', image_url: '', link_type: '', link_value: '', display_order: '0' }) }}>
              <Plus className="h-4 w-4 mr-2" /> Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="Banner title"
                />
              </div>

              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData(p => ({ ...p, subtitle: e.target.value }))}
                  placeholder="Banner subtitle"
                />
              </div>

              <div className="space-y-2">
                <Label>Image URL *</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData(p => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Link Type</Label>
                  <Input
                    value={formData.link_type}
                    onChange={(e) => setFormData(p => ({ ...p, link_type: e.target.value }))}
                    placeholder="category/service/url"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link Value</Label>
                  <Input
                    value={formData.link_value}
                    onChange={(e) => setFormData(p => ({ ...p, link_value: e.target.value }))}
                    placeholder="ID or URL"
                  />
                </div>
              </div>

              <Button className="w-full" onClick={handleSubmit}>
                {editingBanner ? 'Update Banner' : 'Create Banner'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {banners.map((banner) => (
          <Card key={banner.id} className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
              {banner.image_url ? (
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
              ) : (
                <Image className="h-12 w-12 text-white/50" />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-500">{banner.subtitle}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => toggleBanner(banner)}>
                    {banner.is_active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => {
                    setEditingBanner(banner)
                    setFormData({
                      title: banner.title,
                      subtitle: banner.subtitle || '',
                      image_url: banner.image_url,
                      link_type: banner.link_type || '',
                      link_value: banner.link_value || '',
                      display_order: banner.display_order.toString(),
                    })
                    setDialogOpen(true)
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
