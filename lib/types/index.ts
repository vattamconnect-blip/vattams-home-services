export type UserRole = 'customer' | 'technician' | 'admin'

export type BookingStatus =
  | 'pending'
  | 'assigned'
  | 'technician_on_the_way'
  | 'started'
  | 'completed'
  | 'cancelled'

export interface Admin {
  id: string
  user_id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'viewer'
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  image_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  category_id: string
  name: string
  description: string | null
  base_price: number
  duration_minutes: number
  image_url: string | null
  is_popular: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category
}

export interface Banner {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  link_type: 'category' | 'service' | 'url' | null
  link_value: string | null
  display_order: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
}

export interface Customer {
  id: string
  user_id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  city: string | null
  pincode: string | null
  latitude: number | null
  longitude: number | null
  landmark: string | null
  profile_image_url: string | null
  fcm_token: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Technician {
  id: string
  user_id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  city: string | null
  pincode: string | null
  latitude: number | null
  longitude: number | null
  profile_image_url: string | null
  aadhaar_number: string | null
  pan_number: string | null
  skills: string[]
  categories: string[]
  is_online: boolean
  is_approved: boolean
  is_suspended: boolean
  rating: number
  total_jobs: number
  total_earnings: number
  fcm_token: string | null
  bank_account_number: string | null
  bank_ifsc: string | null
  bank_name: string | null
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  booking_number: string
  customer_id: string
  technician_id: string | null
  service_id: string
  category_id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_landmark: string | null
  latitude: number | null
  longitude: number | null
  service_name: string
  service_price: number
  preferred_date: string
  preferred_time: string
  status: BookingStatus
  notes: string | null
  images: string[]
  final_amount: number | null
  parts_used: Array<{ name: string; cost: number }>
  parts_cost: number
  service_charge: number
  discount_amount: number
  coupon_id: string | null
  assigned_at: string | null
  on_the_way_at: string | null
  started_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
  customer?: Customer
  technician?: Technician
  service?: Service
  category?: Category
}

export interface BookingImage {
  id: string
  booking_id: string
  image_type: 'before' | 'after'
  image_url: string
  notes: string | null
  created_at: string
}

export interface Payment {
  id: string
  booking_id: string
  customer_id: string
  technician_id: string | null
  amount: number
  payment_method: 'cash' | 'upi' | 'card' | 'online'
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  transaction_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  booking_id: string
  customer_id: string
  technician_id: string
  rating: number
  comment: string | null
  is_public: boolean
  created_at: string
  customer?: Customer
  technician?: Technician
}

export interface Notification {
  id: string
  user_id: string
  user_type: UserRole
  title: string
  message: string
  type: string
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  max_discount: number | null
  usage_limit: number | null
  used_count: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  booking_id: string
  customer_id: string
  technician_id: string
  subtotal: number
  discount: number
  tax: number
  total: number
  status: 'pending' | 'paid' | 'cancelled'
  paid_at: string | null
  created_at: string
}

export interface AppSetting {
  id: string
  key: string
  value: string | null
  description: string | null
  updated_at: string
}
