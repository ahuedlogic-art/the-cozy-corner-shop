-- Add colors column to products table (array of hex color codes)
ALTER TABLE public.products ADD COLUMN colors text[] DEFAULT '{}';

-- Add selected_color column to cart_items
ALTER TABLE public.cart_items ADD COLUMN selected_color text;