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
import { supabase } from '@/lib/supabase/client'
import { Category } from '@/lib/types'
import { toast } from 'sonner'
import { Plus, Pencil, GripVertical } from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    display_order: '0',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('display_order')

      setCategories(data || [])
    } catch (error) {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Please enter category name')
      return
    }

    const data = {
      name: formData.name,
      description: formData.description || null,
      icon: formData.icon || null,
      display_order: parseInt(formData.display_order) || 0,
    }

    let error
    if (editingCategory) {
      const result = await supabase
        .from('categories')
        .update(data)
        .eq('id', editingCategory.id)
      error = result.error
    } else {
      const result = await supabase.from('categories').insert(data)
      error = result.error
    }

    if (error) {
      toast.error('Failed to save category')
    } else {
      toast.success(editingCategory ? 'Category updated' : 'Category created')
      setDialogOpen(false)
      setEditingCategory(null)
      setFormData({ name: '', description: '', icon: '', display_order: '0' })
      fetchCategories()
    }
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      display_order: category.display_order.toString(),
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingCategory(null); setFormData({ name: '', description: '', icon: '', display_order: '0' }) }}>
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Category Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Enter category name"
                />
              </div>

              <div className="space-y-2">
                <Label>Icon Name</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData(p => ({ ...p, icon: e.target.value }))}
                  placeholder="e.g., wind, zap, wrench"
                />
              </div>

              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(p => ({ ...p, display_order: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Category description"
                />
              </div>

              <Button className="w-full" onClick={handleSubmit}>
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.description || 'No description'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{category.icon || 'No icon'}</Badge>
                <Badge variant={category.is_active ? 'default' : 'secondary'}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
