-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  points INTEGER DEFAULT 50,
  swap_history INTEGER DEFAULT 0,
  location TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clothing_items table
CREATE TABLE IF NOT EXISTS clothing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  size TEXT NOT NULL,
  condition TEXT NOT NULL,
  points INTEGER DEFAULT 20,
  tags TEXT[] DEFAULT '{}',
  uploader_id UUID REFERENCES users(id) ON DELETE CASCADE,
  uploader_name TEXT NOT NULL,
  uploader_avatar TEXT,
  uploader_rating DECIMAL DEFAULT 5.0,
  status TEXT DEFAULT 'available' CHECK (status IN ('pending', 'available', 'in_negotiation', 'swapped', 'removed')),
  views INTEGER DEFAULT 0,
  likes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create swap_requests table
CREATE TABLE IF NOT EXISTS swap_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  from_user_name TEXT NOT NULL,
  from_item_id UUID REFERENCES clothing_items(id) ON DELETE CASCADE,
  from_item_title TEXT NOT NULL,
  from_item_image TEXT,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_name TEXT NOT NULL,
  to_item_id UUID REFERENCES clothing_items(id) ON DELETE CASCADE,
  to_item_title TEXT NOT NULL,
  to_item_image TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create swap_messages table
CREATE TABLE IF NOT EXISTS swap_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swap_request_id UUID REFERENCES swap_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clothing_items_uploader_id ON clothing_items(uploader_id);
CREATE INDEX IF NOT EXISTS idx_clothing_items_status ON clothing_items(status);
CREATE INDEX IF NOT EXISTS idx_clothing_items_category ON clothing_items(category);
CREATE INDEX IF NOT EXISTS idx_clothing_items_created_at ON clothing_items(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_swap_requests_from_user_id ON swap_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_to_user_id ON swap_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_status ON swap_requests(status);

CREATE INDEX IF NOT EXISTS idx_swap_messages_swap_request_id ON swap_messages(swap_request_id);
CREATE INDEX IF NOT EXISTS idx_swap_messages_created_at ON swap_messages(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Create policies for clothing_items table
CREATE POLICY "Anyone can view available items" ON clothing_items FOR SELECT USING (true);
CREATE POLICY "Users can insert own items" ON clothing_items FOR INSERT WITH CHECK (auth.uid()::text = uploader_id);
CREATE POLICY "Users can update own items" ON clothing_items FOR UPDATE USING (auth.uid()::text = uploader_id);
CREATE POLICY "Users can delete own items" ON clothing_items FOR DELETE USING (auth.uid()::text = uploader_id);

-- Create policies for swap_requests table
CREATE POLICY "Users can view their swap requests" ON swap_requests FOR SELECT USING (
  auth.uid()::text = from_user_id OR auth.uid()::text = to_user_id
);
CREATE POLICY "Users can create swap requests" ON swap_requests FOR INSERT WITH CHECK (
  auth.uid()::text = from_user_id
);
CREATE POLICY "Users can update swap requests they're involved in" ON swap_requests FOR UPDATE USING (
  auth.uid()::text = from_user_id OR auth.uid()::text = to_user_id
);

-- Create policies for swap_messages table
CREATE POLICY "Users can view messages for their swaps" ON swap_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM swap_requests 
    WHERE swap_requests.id = swap_messages.swap_request_id 
    AND (swap_requests.from_user_id = auth.uid()::text OR swap_requests.to_user_id = auth.uid()::text)
  )
);
CREATE POLICY "Users can insert messages for their swaps" ON swap_messages FOR INSERT WITH CHECK (
  auth.uid()::text = sender_id AND
  EXISTS (
    SELECT 1 FROM swap_requests 
    WHERE swap_requests.id = swap_messages.swap_request_id 
    AND (swap_requests.from_user_id = auth.uid()::text OR swap_requests.to_user_id = auth.uid()::text)
  )
);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clothing_items_updated_at BEFORE UPDATE ON clothing_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_swap_requests_updated_at BEFORE UPDATE ON swap_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
