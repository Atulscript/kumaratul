-- Insert 10 Dummy Customers for Testing
-- Run this AFTER creating the tables from database-schema.sql
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