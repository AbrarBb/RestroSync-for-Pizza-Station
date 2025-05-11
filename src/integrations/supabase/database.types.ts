
export interface ProfileData {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  preferences: string | null;
  created_at: string;
}

export interface OrderMessage {
  id: string;
  order_id: string;
  sender_id: string;
  sender_role: 'admin' | 'staff' | 'customer';
  message: string;
  created_at: string;
}

export interface DeliveryAssignment {
  id: string;
  order_id: string;
  driver_id: string;
  driver_name: string;
  status: 'assigned' | 'picked_up' | 'delivered';
  assigned_at: string;
  delivered_at: string | null;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  discount_amount: number | null;
  minimum_order: number | null;
  expiry_date: string | null;
  is_active: boolean;
}
