# Sleek CRM - Customer Management System

A comprehensive CRM system built with React, Vite, Tailwind CSS, and InsForge backend.

## Features Implemented

### ✅ Phase 1 - Customer Management
- Customer database with full CRUD operations
- Customer status tracking (Lead, Active, Inactive)
- Contact information management
- Notes and activity tracking
- Beautiful Discord-inspired UI matching your main site

### 🚧 Coming Next
- Project Management
- Quotation Generator
- Customer Portal
- Calendar Integration

## Setup Instructions

### 1. Database Setup

First, you need to create the database tables in InsForge. Run the SQL schema:

```bash
# The database schema is in: database-schema.sql
# You need to execute it using InsForge MCP tools or the InsForge dashboard
```

**Using InsForge MCP (Recommended):**
Tell your AI agent: "Run the SQL in database-schema.sql using InsForge run-raw-sql tool"

**OR Using InsForge Dashboard:**
1. Go to your InsForge dashboard
2. Navigate to SQL Editor
3. Copy the contents of `database-schema.sql`
4. Execute the SQL

### 2. Install Dependencies

Dependencies are already installed, but if needed:

```bash
cd crm/crm-app
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

The CRM will be available at `http://localhost:5173`

## Project Structure

```
crm-app/
├── src/
│   ├── components/
│   │   └── CustomerManagement.jsx  # Customer management UI
│   ├── lib/
│   │   └── insforge.js             # InsForge SDK client
│   ├── App.jsx                      # Main app component
│   └── index.css                    # Tailwind CSS styles
├── database-schema.sql              # Database schema
└── tailwind.config.js               # Tailwind configuration
```

## Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS 3.4
- **Backend**: InsForge (PostgreSQL + Auth + Storage)
- **Database**: PostgreSQL via InsForge
- **Authentication**: InsForge Auth (coming in next phase)

## Database Schema

### Customers Table
- Company information
- Contact details
- Status tracking
- Notes

### Projects Table (Coming Soon)
- Project tracking
- Timeline management
- Budget tracking

### Quotations Table (Coming Soon)
- Quote generation
- PDF export
- Approval workflow

### Contacts/Activities Table (Coming Soon)
- Communication history
- Follow-up tracking

### Appointments Table (Coming Soon)
- Calendar integration
- Google Calendar sync

## Next Steps

1. **Run the database schema** (see Setup Instructions above)
2. **Start the dev server**: `npm run dev`
3. **Test customer creation** - Add a few test customers
4. **Ready for Phase 2** - Project Management module

## API Configuration

The InsForge client is configured in `src/lib/insforge.js`:
- Base URL: `https://nztq5ms6.ap-southeast.insforge.app`
- Anon Key: Already configured

## Deployment

To build for production:

```bash
npm run build
```

The build output will be in the `dist/` folder, ready to deploy to your server.

## Support

For InsForge documentation:
- 📚 [InsForge Docs](https://docs.insforge.dev)
- 💬 [Discord Community](https://discord.com/invite/MPxwj5xVvW)
