
-- Create bids table
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Anyone can view bids (to see highest bid, bid history)
CREATE POLICY "Anyone can view bids"
  ON public.bids FOR SELECT
  USING (true);

-- Authenticated users can place bids
CREATE POLICY "Users can insert their own bids"
  ON public.bids FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bids
CREATE POLICY "Users can update their own bids"
  ON public.bids FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime for bids
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
