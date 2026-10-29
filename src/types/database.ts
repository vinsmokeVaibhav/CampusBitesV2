export type UserRole = 'student' | 'admin' | 'kitchen_staff';

export interface User {
  id: string;
  student_id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  password_hash: string;
  created_at: string;
}

export type MenuCategory = 'Breakfast' | 'Mains' | 'Beverages' | 'Quick Grab';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  is_veg: boolean; // true = Veg, false = Non-Veg
  is_jain?: boolean; // Jain-friendly (no root vegetables, onions, garlic)
  prep_time_mins: number;
  image_url: string;
  image_alt: string;
  in_stock: boolean;
  ordered_today_count: number;
}

export type OrderStatus = 'TAKEN' | 'COOKING' | 'COOKED' | 'PICKED_UP' | 'CANCELLED';

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  order_id: string; // e.g. "CB-8492"
  user_id?: string;
  student_name: string;
  student_roll: string;
  student_phone: string;
  items: OrderItem[];
  subtotal: number;
  tax_gst: number;
  total_amount: number;
  status: OrderStatus;
  pickup_slot: string; // e.g. "Immediate (Next in line)", "11:15 AM Short Break", "01:00 PM Lunch Break"
  counter_no: number; // e.g. Counter 1, 2, or 3
  token_number: string; // 4-digit token e.g. "8492"
  consent_recorded: boolean;
  created_at: string;
  updated_at: string;
  estimated_ready_at?: string;
}

export type PaymentMethod = 'UPI' | 'CARD' | 'CAMPUS_WALLET';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Payment {
  payment_id: string;
  order_id: string;
  amount: number;
  method: PaymentMethod;
  transaction_ref: string;
  status: PaymentStatus;
  timestamp: string;
}

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentLog {
  id: string;
  user_identifier: string;
  cookie_preferences: CookiePreferences;
  form_consent_timestamp: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}
