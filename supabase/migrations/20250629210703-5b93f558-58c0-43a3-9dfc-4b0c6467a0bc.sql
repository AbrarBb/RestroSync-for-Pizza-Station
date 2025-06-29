
-- Enable RLS on all tables that need it
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS TEXT AS $$
BEGIN
  -- Determine role based on email (matching AuthContext logic)
  DECLARE
    user_email TEXT;
  BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = user_id;
    
    IF user_email = 'admin@pizzastation.com' THEN
      RETURN 'admin';
    ELSIF user_email = 'staff@pizzastation.com' OR user_email LIKE '%@pizzastation.com' THEN
      RETURN 'staff';
    ELSE
      RETURN 'customer';
    END IF;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Profiles table policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff and admin can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'staff'));

-- Reservations table policies
CREATE POLICY "Users can view their own reservations" ON public.reservations
  FOR SELECT USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR public.get_user_role(auth.uid()) IN ('admin', 'staff')
  );

CREATE POLICY "Anyone can create reservations" ON public.reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff and admin can update reservations" ON public.reservations
  FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('admin', 'staff'));

-- Orders table policies
CREATE POLICY "Customers can view their own orders" ON public.orders
  FOR SELECT USING (
    (customer_id = auth.uid() AND auth.uid() IS NOT NULL)
    OR (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND auth.uid() IS NOT NULL)
    OR public.get_user_role(auth.uid()) IN ('admin', 'staff')
  );

CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff and admin can update orders" ON public.orders
  FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('admin', 'staff'));

-- Order messages policies
CREATE POLICY "Order participants can view messages" ON public.order_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_id 
      AND (
        o.customer_id = auth.uid() 
        OR o.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR public.get_user_role(auth.uid()) IN ('admin', 'staff')
      )
    )
  );

CREATE POLICY "Order participants can send messages" ON public.order_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_id 
      AND (
        o.customer_id = auth.uid() 
        OR o.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR public.get_user_role(auth.uid()) IN ('admin', 'staff')
      )
    )
  );

-- Delivery assignments policies
CREATE POLICY "Staff and admin can manage deliveries" ON public.delivery_assignments
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'staff'));

-- Coupons policies
CREATE POLICY "Staff and admin can manage coupons" ON public.coupons
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'staff'));

CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true AND (expiry_date IS NULL OR expiry_date > now()));

-- Menu items policies
CREATE POLICY "Anyone can view active menu items" ON public.menu_items
  FOR SELECT USING (status = 'available');

CREATE POLICY "Staff and admin can manage menu items" ON public.menu_items
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'staff'));
