
-- Add the missing special_requests column to the orders table
ALTER TABLE public.orders 
ADD COLUMN special_requests text;
