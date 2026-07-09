'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Category, Service, Banner } from '@/lib/types'
import { toast } from 'sonner'
import {
  Search,
  Wind,
  Refrigerator,
  Droplets,
  Video,
  Zap,
  Wrench,
  ChevronRight,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

const iconMap: Record<string, any> = {
  wind: Wind,
  thermometer: Refrigerator,
  droplets: Droplets,
  video: Video,
  zap: Zap,
  wrench: Wrench,
}

export default function CustomerHomePage() {
  const router = useRouter()
  const { user, customer, loading: authLoading } = useAuth()
  const [banners, setBanners] = useState<Banner[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [popularServices, setPopularServices] = useState<(Service & { category: Category })[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/customer')
      return
    }
    if (!authLoading && user && !customer) {
      router.push('/customer/setup')
      return
    }
    if (customer) {
      fetchData()
    }
  }, [user, customer, authLoading, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: bannersData } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(5)

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      const { data: servicesData } = await supabase
        .from('services')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .eq('is_popular', true)
        .limit(10)

      setBanners(bannersData || [])
      setCategories(categoriesData || [])
      setPopularServices(servicesData || [])
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/customer/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <AppShell>
      <div className="p-4 space-y-6">
        {/* Search */}
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </form>

        {/* Welcome */}
        <div className="mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            Hello, {customer?.name?.split(' ')[0] || ''}
          </h2>
          <p className="text-sm text-gray-500">What service do you need today?</p>
        </div>

        {/* Banners */}
        {banners.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {banners.map((banner) => (
              <Card
                key={banner.id}
                className="min-w-[280px] h-32 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
              >
                <div className="h-full p-4 flex flex-col justify-center">
                  <h3 className="font-bold text-lg">{banner.title}</h3>
                  <p className="text-blue-100 text-sm">{banner.subtitle}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Categories */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon || ''] || Wrench
              return (
                <Card
                  key={category.id}
                  className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/customer/category/${category.id}`)}
                >
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{category.name}</p>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Popular Services */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Popular Services</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/customer/services')}
              className="text-blue-600"
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {popularServices.map((service) => (
              <Card
                key={service.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/customer/service/${service.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-500">{service.category?.name}</p>
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      ₹{service.base_price}
                    </p>
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
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t safe-bottom">
        <div className="flex justify-around py-2">
          <button
            onClick={() => router.push('/customer/home')}
            className="flex flex-col items-center px-4 py-2 text-blue-600"
          >
            <Wrench className="h-5 w-5" />
            <span className="text-xs mt-1">Services</span>
          </button>
          <button
            onClick={() => router.push('/customer/bookings')}
            className="flex flex-col items-center px-4 py-2 text-gray-500"
          >
            <img src="/calendar.svg" alt="" className="h-5 w-5" />
            <span className="text-xs mt-1">Bookings</span>
          </button>
          <button
            onClick={() => router.push('/customer/profile')}
            className="flex flex-col items-center px-4 py-2 text-gray-500"
          >
            <img src="/user.svg" alt="" className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </AppShell>
  )
}
