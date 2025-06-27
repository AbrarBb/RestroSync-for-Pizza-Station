
-- Check current constraints on orders table using the correct column name
SELECT con.conname, pg_get_constraintdef(con.oid) as definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'orders' AND con.contype = 'c';

-- Drop the existing constraint if it exists
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_type_check;

-- Add the correct check constraint with proper values
ALTER TABLE orders ADD CONSTRAINT orders_order_type_check 
CHECK (order_type IN ('delivery', 'pickup', 'dine_in'));
