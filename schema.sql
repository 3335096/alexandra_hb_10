CREATE TABLE IF NOT EXISTS gifts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT NOT NULL,
  image_url TEXT,
  price NUMERIC,
  is_group_gift BOOLEAN DEFAULT false,
  target_amount NUMERIC,
  collected_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'available', -- available, reserved, purchased
  reserved_by_name TEXT,
  reserved_at TIMESTAMPTZ,
  contributors JSONB DEFAULT '[]', -- [{name: "Имя", amount: 500}]
  admin_note TEXT, -- заметка администратора (складчина / внутреннее), не показывается гостям
  created_at TIMESTAMPTZ DEFAULT NOW()
);