-- Add shipping and payment fields to orders table
ALTER TABLE public.orders 
ADD COLUMN shipping_address text,
ADD COLUMN shipping_city text,
ADD COLUMN shipping_postal_code text,
ADD COLUMN shipping_country text,
ADD COLUMN shipping_phone text,
ADD COLUMN payment_method text DEFAULT 'card',
ADD COLUMN order_notes text;

-- Create admin_notifications table for stock alerts and new orders
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL, -- 'low_stock', 'out_of_stock', 'new_order'
  title text NOT NULL,
  message text NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage notifications
CREATE POLICY "Admins can view notifications" 
ON public.admin_notifications 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update notifications" 
ON public.admin_notifications 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete notifications" 
ON public.admin_notifications 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow system to insert notifications (via trigger)
CREATE POLICY "System can insert notifications" 
ON public.admin_notifications 
FOR INSERT 
WITH CHECK (true);

-- Create function to notify on low stock
CREATE OR REPLACE FUNCTION public.check_stock_and_notify()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if stock is now 0
  IF NEW.stock_quantity = 0 AND OLD.stock_quantity > 0 THEN
    INSERT INTO public.admin_notifications (type, title, message, product_id)
    VALUES ('out_of_stock', 'Product Out of Stock', 'Product "' || NEW.name || '" is now out of stock.', NEW.id);
  -- Check if stock is low (5 or less)
  ELSIF NEW.stock_quantity <= 5 AND NEW.stock_quantity > 0 AND OLD.stock_quantity > 5 THEN
    INSERT INTO public.admin_notifications (type, title, message, product_id)
    VALUES ('low_stock', 'Low Stock Alert', 'Product "' || NEW.name || '" has only ' || NEW.stock_quantity || ' items left.', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for stock check
CREATE TRIGGER check_stock_notification
AFTER UPDATE ON public.products
FOR EACH ROW
WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
EXECUTE FUNCTION public.check_stock_and_notify();

-- Create function to notify on new orders
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
  product_name text;
BEGIN
  SELECT name INTO product_name FROM public.products WHERE id = NEW.product_id;
  
  INSERT INTO public.admin_notifications (type, title, message, order_id, product_id)
  VALUES ('new_order', 'New Order Received', 'New order for "' || COALESCE(product_name, 'Unknown Product') || '" - Quantity: ' || NEW.quantity || ', Total: $' || NEW.total_price, NEW.id, NEW.product_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new orders
CREATE TRIGGER notify_on_new_order
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_order();