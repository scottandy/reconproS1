/*
  # Initial Schema for Dealership Reconditioning App

  1. New Tables
    - `dealerships` - Stores dealership information
    - `users` - Stores user information
    - `vehicles` - Stores vehicle information
    - `team_notes` - Stores notes about vehicles
    - `contacts` - Stores contact information
    - `todos` - Stores todo items
    - `locations` - Stores location information
    - `analytics_events` - Stores analytics events
    - `inspection_data` - Stores vehicle inspection data
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their dealership's data
*/

-- Create dealerships table
CREATE TABLE IF NOT EXISTS dealerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  website TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  subscription_plan TEXT NOT NULL DEFAULT 'basic',
  max_users INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  initials TEXT NOT NULL,
  role TEXT NOT NULL,
  dealership_id UUID NOT NULL REFERENCES dealerships(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id UUID NOT NULL REFERENCES dealerships(id),
  vin TEXT NOT NULL,
  year INTEGER NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  trim TEXT,
  mileage INTEGER NOT NULL,
  color TEXT NOT NULL,
  date_acquired DATE NOT NULL,
  target_sale_date DATE,
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  location_changed_by TEXT,
  location_changed_date TIMESTAMPTZ,
  status_emissions TEXT NOT NULL DEFAULT 'not-started',
  status_cosmetic TEXT NOT NULL DEFAULT 'not-started',
  status_mechanical TEXT NOT NULL DEFAULT 'not-started',
  status_cleaned TEXT NOT NULL DEFAULT 'not-started',
  status_photos TEXT NOT NULL DEFAULT 'not-started',
  notes TEXT,
  is_sold BOOLEAN NOT NULL DEFAULT FALSE,
  sold_by TEXT,
  sold_date TIMESTAMPTZ,
  sold_price NUMERIC,
  sold_notes TEXT,
  is_pending BOOLEAN NOT NULL DEFAULT FALSE,
  pending_by TEXT,
  pending_date TIMESTAMPTZ,
  pending_notes TEXT,
  reactivated_by TEXT,
  reactivated_date TIMESTAMPTZ,
  reactivated_from TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create team_notes table
CREATE TABLE IF NOT EXISTS team_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  text TEXT NOT NULL,
  user_initials TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  is_certified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id UUID NOT NULL REFERENCES dealerships(id),
  name TEXT NOT NULL,
  company TEXT,
  title TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  category TEXT NOT NULL,
  specialties TEXT[],
  notes TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_contacted TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id UUID NOT NULL REFERENCES dealerships(id),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  category TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  assigned_by TEXT NOT NULL,
  due_date DATE,
  due_time TEXT,
  vehicle_id UUID REFERENCES vehicles(id),
  vehicle_name TEXT,
  tags TEXT[],
  notes TEXT,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurring_pattern TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id UUID NOT NULL REFERENCES dealerships(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  capacity INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id UUID NOT NULL REFERENCES dealerships(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  vehicle_name TEXT NOT NULL,
  section TEXT NOT NULL,
  section_name TEXT NOT NULL,
  completed_by TEXT NOT NULL,
  completed_date DATE NOT NULL,
  item_name TEXT,
  old_rating TEXT,
  new_rating TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create inspection_data table
CREATE TABLE IF NOT EXISTS inspection_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  section_key TEXT NOT NULL,
  items JSONB NOT NULL,
  section_notes TEXT,
  overall_notes TEXT,
  last_saved TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_data ENABLE ROW LEVEL SECURITY;

-- Create policies for dealerships
CREATE POLICY "Users can view their own dealership"
  ON dealerships FOR SELECT
  USING (id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

-- Create policies for users
CREATE POLICY "Users can view users in their dealership"
  ON users FOR SELECT
  USING (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

-- Create policies for vehicles
CREATE POLICY "Users can view vehicles in their dealership"
  ON vehicles FOR SELECT
  USING (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

CREATE POLICY "Users can insert vehicles in their dealership"
  ON vehicles FOR INSERT
  WITH CHECK (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

CREATE POLICY "Users can update vehicles in their dealership"
  ON vehicles FOR UPDATE
  USING (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

-- Create policies for team_notes
CREATE POLICY "Users can view team notes for vehicles in their dealership"
  ON team_notes FOR SELECT
  USING (vehicle_id IN (
    SELECT id FROM vehicles WHERE dealership_id IN (
      SELECT dealership_id FROM users WHERE auth.uid() = id
    )
  ));

CREATE POLICY "Users can insert team notes for vehicles in their dealership"
  ON team_notes FOR INSERT
  WITH CHECK (vehicle_id IN (
    SELECT id FROM vehicles WHERE dealership_id IN (
      SELECT dealership_id FROM users WHERE auth.uid() = id
    )
  ));

-- Create policies for contacts
CREATE POLICY "Users can view contacts in their dealership"
  ON contacts FOR SELECT
  USING (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

CREATE POLICY "Users can insert contacts in their dealership"
  ON contacts FOR INSERT
  WITH CHECK (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

CREATE POLICY "Users can update contacts in their dealership"
  ON contacts FOR UPDATE
  USING (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

CREATE POLICY "Users can delete contacts in their dealership"
  ON contacts FOR DELETE
  USING (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

-- Create policies for todos
CREATE POLICY "Users can view todos in their dealership"
  ON todos FOR SELECT
  USING (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

CREATE POLICY "Users can insert todos in their dealership"
  ON todos FOR INSERT
  WITH CHECK (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

CREATE POLICY "Users can update todos in their dealership"
  ON todos FOR UPDATE
  USING (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

CREATE POLICY "Users can delete todos in their dealership"
  ON todos FOR DELETE
  USING (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

-- Create policies for locations
CREATE POLICY "Users can view locations in their dealership"
  ON locations FOR SELECT
  USING (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

CREATE POLICY "Users can insert locations in their dealership"
  ON locations FOR INSERT
  WITH CHECK (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

CREATE POLICY "Users can update locations in their dealership"
  ON locations FOR UPDATE
  USING (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

CREATE POLICY "Users can delete locations in their dealership"
  ON locations FOR DELETE
  USING (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

-- Create policies for analytics_events
CREATE POLICY "Users can view analytics events in their dealership"
  ON analytics_events FOR SELECT
  USING (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

CREATE POLICY "Users can insert analytics events in their dealership"
  ON analytics_events FOR INSERT
  WITH CHECK (dealership_id IN (
    SELECT dealership_id FROM users WHERE auth.uid() = id
  ));

-- Create policies for inspection_data
CREATE POLICY "Users can view inspection data for vehicles in their dealership"
  ON inspection_data FOR SELECT
  USING (vehicle_id IN (
    SELECT id FROM vehicles WHERE dealership_id IN (
      SELECT dealership_id FROM users WHERE auth.uid() = id
    )
  ));

CREATE POLICY "Users can insert inspection data for vehicles in their dealership"
  ON inspection_data FOR INSERT
  WITH CHECK (vehicle_id IN (
    SELECT id FROM vehicles WHERE dealership_id IN (
      SELECT dealership_id FROM users WHERE auth.uid() = id
    )
  ));

CREATE POLICY "Users can update inspection data for vehicles in their dealership"
  ON inspection_data FOR UPDATE
  USING (vehicle_id IN (
    SELECT id FROM vehicles WHERE dealership_id IN (
      SELECT dealership_id FROM users WHERE auth.uid() = id
    )
  ));