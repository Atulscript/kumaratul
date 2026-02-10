# Database Setup Instructions

## Quick Setup - Run the Database Schema

You have the complete database schema in `database-schema.sql`. Here are your options to set it up:

### Option 1: Using InsForge Dashboard (Easiest)

1. Go to your InsForge dashboard: https://nztq5ms6.ap-southeast.insforge.app
2. Navigate to the **SQL Editor** section
3. Copy the entire contents of `database-schema.sql`
4. Paste it into the SQL editor
5. Click **Execute** or **Run**

### Option 2: Using InsForge MCP Tools (Recommended for AI Agents)

Tell your AI agent (in a new conversation or after restarting):

```
Run the SQL in crm/crm-app/database-schema.sql using InsForge run-raw-sql tool
```

The AI will use the InsForge MCP to execute the schema automatically.

### Option 3: Manual Table Creation (If SQL fails)

If the full SQL doesn't work, you can create tables one by one through the InsForge dashboard:

1. **Customers Table** - Core customer data
2. **Projects Table** - Project tracking
3. **Quotations Table** - Quote management
4. **Contacts Table** - Activity tracking
5. **Appointments Table** - Calendar integration

## Verify Setup

After running the schema, verify in your InsForge dashboard that these tables exist:
- ✅ customers
- ✅ projects
- ✅ quotations
- ✅ contacts
- ✅ appointments

## Test the CRM

1. Make sure the dev server is running: `npm run dev`
2. Open http://localhost:5173/
3. Click "Add Customer" to create your first customer
4. Fill in the form and submit

## Troubleshooting

### If you see "Error fetching customers"
- Check that the database tables are created
- Verify your InsForge connection in `src/lib/insforge.js`
- Check browser console for detailed error messages

### If RLS (Row Level Security) blocks you
The schema includes RLS policies. For testing, you might want to temporarily disable RLS or create an admin user. You can modify the policies in the SQL file if needed.

### Quick Test Without RLS
If you want to test without authentication first, you can comment out the RLS policies in the SQL file (lines 105-155).

## Next Steps

Once the database is set up and you can create customers:
1. Test adding multiple customers
2. We'll move on to **Project Management** module
3. Then **Quotation Generator**
4. Finally **Customer Portal** with authentication
