
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS creator_name text,
ADD COLUMN IF NOT EXISTS collection_name text,
ADD COLUMN IF NOT EXISTS blockchain text DEFAULT 'Ethereum',
ADD COLUMN IF NOT EXISTS token_id text,
ADD COLUMN IF NOT EXISTS token_standard text DEFAULT 'ERC-721',
ADD COLUMN IF NOT EXISTS royalty_percentage numeric DEFAULT 0;
