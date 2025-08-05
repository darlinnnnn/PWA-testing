-- Create the data_items table for the PWA app
CREATE TABLE IF NOT EXISTS data_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  device_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE data_items ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations" ON data_items
  FOR ALL USING (true);

-- Create an index on created_at for better performance
CREATE INDEX IF NOT EXISTS idx_data_items_created_at ON data_items(created_at DESC);

-- Optional: Create a function to get the latest data
CREATE OR REPLACE FUNCTION get_latest_data(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  description TEXT,
  device_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    di.id,
    di.name,
    di.description,
    di.device_token,
    di.created_at
  FROM data_items di
  ORDER BY di.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql; 

-- Create table for PWA device tokens
CREATE TABLE IF NOT EXISTS pwa_device_tokens (
  id SERIAL PRIMARY KEY,
  device_token TEXT UNIQUE NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pwa_device_tokens_token ON pwa_device_tokens(device_token);
CREATE INDEX IF NOT EXISTS idx_pwa_device_tokens_active ON pwa_device_tokens(is_active);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_pwa_device_tokens_updated_at
    BEFORE UPDATE ON pwa_device_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create table for transactions (based on your screenshot)
CREATE TABLE IF NOT EXISTS transaksi (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nomor_flo TEXT,
  deskripsi TEXT,
  kategori TEXT
);

-- Create table for categories
CREATE TABLE IF NOT EXISTS kategori (
  id SERIAL PRIMARY KEY,
  nama TEXT UNIQUE NOT NULL,
  tipe TEXT NOT NULL CHECK (tipe IN ('pemasukan', 'pengeluaran')),
  icon TEXT DEFAULT 'DollarSign',
  warna TEXT DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for budgets
CREATE TABLE IF NOT EXISTS budget (
  id SERIAL PRIMARY KEY,
  bulan INTEGER NOT NULL CHECK (bulan >= 1 AND bulan <= 12),
  tahun INTEGER NOT NULL,
  jumlah DECIMAL(15,2) NOT NULL,
  kategori_id INTEGER REFERENCES kategori(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bulan, tahun, kategori_id)
);

-- Create trigger for kategori updated_at
CREATE TRIGGER update_kategori_updated_at
    BEFORE UPDATE ON kategori
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for budget updated_at
CREATE TRIGGER update_budget_updated_at
    BEFORE UPDATE ON budget
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample transaction data
INSERT INTO transaksi (nomor_flo, deskripsi, kategori) VALUES
  ('FL001', 'Pembelian bahan baku', 'Pengeluaran'),
  ('FL002', 'Penjualan produk A', 'Pemasukan'),
  ('FL003', 'Biaya operasional', 'Pengeluaran'),
  ('FL004', 'Pendapatan jasa', 'Pemasukan'),
  ('FL005', 'Maintenance equipment', 'Pengeluaran');

-- Insert default categories
INSERT INTO kategori (nama, tipe, icon, warna) VALUES
  ('Gaji', 'pemasukan', 'TrendingUp', '#10B981'),
  ('Bonus', 'pemasukan', 'Gift', '#10B981'),
  ('Investasi', 'pemasukan', 'TrendingUp', '#10B981'),
  ('Makanan', 'pengeluaran', 'Utensils', '#EF4444'),
  ('Transport', 'pengeluaran', 'Car', '#EF4444'),
  ('Belanja', 'pengeluaran', 'ShoppingBag', '#EF4444'),
  ('Tagihan', 'pengeluaran', 'FileText', '#EF4444'),
  ('Hiburan', 'pengeluaran', 'Music', '#EF4444'),
  ('Kesehatan', 'pengeluaran', 'Heart', '#EF4444'),
  ('Pendidikan', 'pengeluaran', 'BookOpen', '#EF4444')
ON CONFLICT (nama) DO NOTHING; 