-- SIMPLIFIED DATABASE SCHEMA (Without RLS for easier testing)
-- Copy and paste this entire script into InsForge SQL Editor
-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
-- Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
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
CREATE TABLE projects (
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
CREATE TABLE quotations (
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
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (
        type IN ('call', 'email', 'meeting', 'note', 'task')
    ),
    subject TEXT NOT NULL,
    notes TEXT,
    contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Appointments Table
CREATE TABLE appointments (
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
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_projects_customer ON projects(customer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_quotations_customer ON quotations(customer_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_contacts_customer ON contacts(customer_id);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
-- Insert 10 Dummy Customers
INSERT INTO customers (
        company_name,
        contact_person,
        email,
        phone,
        address,
        status,
        notes
    )
VALUES (
        'TechStart Solutions',
        'Sarah Johnson',
        'sarah.johnson@techstart.com',
        '+1-555-0101',
        '123 Innovation Drive, San Francisco, CA 94105',
        'active',
        'Looking for digital marketing services. High potential client.'
    ),
    (
        'Global Ventures Inc',
        'Michael Chen',
        'michael.chen@globalventures.com',
        '+1-555-0102',
        '456 Business Plaza, New York, NY 10001',
        'active',
        'Interested in Google Ads campaign. Budget: $10k/month'
    ),
    (
        'Creative Minds Agency',
        'Emma Williams',
        'emma@creativeminds.co',
        '+1-555-0103',
        '789 Design Street, Austin, TX 78701',
        'lead',
        'Contacted via website form. Needs Meta Ads consultation.'
    ),
    (
        'EcoGreen Products',
        'David Martinez',
        'david.m@ecogreen.com',
        '+1-555-0104',
        '321 Sustainability Ave, Portland, OR 97201',
        'active',
        'Running successful campaigns. Monthly retainer client.'
    ),
    (
        'FinTech Innovations',
        'Lisa Anderson',
        'lisa.anderson@fintech-inn.com',
        '+1-555-0105',
        '654 Finance Blvd, Boston, MA 02101',
        'lead',
        'Referred by TechStart Solutions. Interested in CRM integration.'
    ),
    (
        'HealthPlus Clinic',
        'Dr. James Wilson',
        'jwilson@healthplus.med',
        '+1-555-0106',
        '987 Medical Center Dr, Chicago, IL 60601',
        'active',
        'Healthcare marketing compliance required. Ongoing project.'
    ),
    (
        'FoodHub Delivery',
        'Maria Garcia',
        'maria@foodhub.delivery',
        '+1-555-0107',
        '147 Restaurant Row, Los Angeles, CA 90001',
        'inactive',
        'Paused campaigns for Q1. Resume in April.'
    ),
    (
        'SmartHome Tech',
        'Robert Taylor',
        'robert.t@smarthometech.io',
        '+1-555-0108',
        '258 IoT Boulevard, Seattle, WA 98101',
        'lead',
        'Requested quote for product launch campaign.'
    ),
    (
        'Fashion Forward Boutique',
        'Jennifer Lee',
        'jennifer@fashionforward.shop',
        '+1-555-0109',
        '369 Style Street, Miami, FL 33101',
        'active',
        'E-commerce client. Strong ROI on Meta Ads.'
    ),
    (
        'BuildRight Construction',
        'Thomas Brown',
        'thomas.brown@buildright.co',
        '+1-555-0110',
        '741 Construction Way, Denver, CO 80201',
        'lead',
        'B2B lead generation focus. Needs Zoho CRM setup.'
    );
-- Success message
SELECT 'Database setup complete! Tables created and 10 dummy customers added.' AS message;