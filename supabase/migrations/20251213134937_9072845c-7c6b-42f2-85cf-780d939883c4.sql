-- Add sizes column to products table (array of available sizes)
ALTER TABLE public.products ADD COLUMN sizes text[] DEFAULT '{}';

-- Add selected_size column to cart_items
ALTER TABLE public.cart_items ADD COLUMN selected_size text;