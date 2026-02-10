-- CRM Database Schema for InsForge
-- Run this using: InsForge MCP run-raw-sql tool
-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lead')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planning' CHECK (
        status IN (
            'planning',
            'in_progress',
            'review',
            'completed',
            'on_hold',
            'cancelled'
        )
    ),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    progress INTEGER DEFAULT 0 CHECK (
        progress >= 0
        AND progress <= 100
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE
    SET NULL,
        quotation_number TEXT UNIQUE NOT NULL,
        items JSONB NOT NULL DEFAULT '[]',
        subtotal DECIMAL(10, 2) NOT NULL,
        tax DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        status TEXT DEFAULT 'draft' CHECK (
            status IN (
                'draft',
                'sent',
                'approved',
                'rejected',
                'expired'
            )
        ),
        valid_until DATE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Contacts/Activities Table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (
        type IN ('call', 'email', 'meeting', 'note', 'task')
    ),
    subject TEXT NOT NULL,
    notes TEXT,
    contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    google_event_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'completed', 'cancelled', 'no_show')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_contacts_customer ON contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);
-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- RLS Policies (Admin can see all, customers can only see their own data)
-- Customers - Admin full access
CREATE POLICY "Admin full access to customers" ON customers FOR ALL USING (auth.jwt()->>'role' = 'admin');
-- Customers - Users can see their own customer record
CREATE POLICY "Users can view own customer record" ON customers FOR
SELECT USING (user_id = auth.uid());
-- Projects - Admin full access
CREATE POLICY "Admin full access to projects" ON projects FOR ALL USING (auth.jwt()->>'role' = 'admin');
-- Projects - Customers can view their projects
CREATE POLICY "Customers can view own projects" ON projects FOR
SELECT USING (
        customer_id IN (
            SELECT id
            FROM customers
            WHERE user_id = auth.uid()
        )
    );
-- Similar policies for other tables
CREATE POLICY "Admin full access to quotations" ON quotations FOR ALL USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Customers can view own quotations" ON quotations FOR
SELECT USING (
        customer_id IN (
            SELECT id
            FROM customers
            WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Admin full access to contacts" ON contacts FOR ALL USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Customers can view own contacts" ON contacts FOR
SELECT USING (
        customer_id IN (
            SELECT id
            FROM customers
            WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Admin full access to appointments" ON appointments FOR ALL USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Customers can view own appointments" ON appointments FOR
SELECT USING (
        customer_id IN (
            SELECT id
            FROM customers
            WHERE user_id = auth.uid()
        )
    );