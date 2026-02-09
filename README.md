 Mini Insighter 💡

A modern data analytics platform that lets you chat with your BigQuery data. Ask questions in plain English and get instant insights with beautiful visualizations.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Auth-green?style=flat-square&logo=supabase)
![BigQuery](https://img.shields.io/badge/BigQuery-Connected-orange?style=flat-square&logo=google-cloud)

 What is this?

Mini Insighter is like having a data analyst in your pocket. Instead of writing complex SQL queries, just ask questions like:
- "What were the top 5 sales regions last month?"
- "Show me the revenue trend"
- "Which products are performing best?"

The app understands your question, generates the SQL, runs it on your BigQuery dataset, and shows you the results with charts and tables.

Features

- Natural Language Queries - Talk to your data like you're chatting with a colleague
-  Smart Visualizations - Automatic charts, tables, and KPIs based on your data
-  Secure Authentication - User accounts powered by Supabase
-  Real-time Results - Lightning-fast queries on Google BigQuery
-  Beautiful UI - Clean, modern interface with dark mode support
-  Responsive Design - Works perfectly on desktop, tablet, and mobile

 Tech Stack

- Frontend: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Database: Supabase (PostgreSQL)
- Data Warehouse: Google BigQuery
- Authentication: Supabase Auth
- Deployment: Vercel-ready

 Prerequisites

Before you start, make sure you have:

- Node.js 18 or higher ([Download](https://nodejs.org/))
- A Supabase account ([Sign up free](https://supabase.com))
- A Google Cloud account with BigQuery enabled ([Get started](https://cloud.google.com/bigquery))
- Git (optional, for cloning)

 Quick Start

 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mini-insighter.git
cd mini-insighter
```

 2. Install Dependencies

```bash
npm install
```

 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
 Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

 BigQuery Configuration
GOOGLE_CLOUD_PROJECT=your_gcp_project_id
BIGQUERY_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"..."}'

 App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Where to find these values:

- Supabase: Go to your [Supabase Dashboard](https://app.supabase.com) → Project Settings → API
- BigQuery: Create a service account in [Google Cloud Console](https://console.cloud.google.com) → IAM & Admin → Service Accounts → Create Key (JSON)

 4. Set Up the Database

Run the Supabase migrations to create the necessary tables:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the SQL files in /supabase/migrations in your Supabase SQL Editor
```

 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the login page!

 How to Use

 First Time Setup
1. Sign Up - Create your account at `/signup`
2. Create a Project - Click "New Project" on the dashboard
3. Link BigQuery Dataset - Connect your BigQuery table
4. Start Chatting - Ask questions about your data!

 Connecting BigQuery
When you create a project, you'll need to provide:
- Project ID: Your Google Cloud project ID (e.g., `my-project-123`)
- Dataset ID: The BigQuery dataset name (e.g., `sales_data`)
- Table ID: The table you want to query (e.g., `transactions`)

The app will automatically fetch the schema and you're ready to go!

 Example Questions

Try asking:
- "Show me all records"
- "What's the total revenue?"
- "Top 10 customers by sales"
- "Sales by region"
- "Average order value"

 Project Structure

```
mini-insighter/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (auth)/            # Authentication pages (login, signup)
│   │   ├── dashboard/         # Main dashboard and project pages
│   │   └── api/               # API routes
│   ├── components/            # Reusable React components
│   ├── lib/                   # Core business logic
│   │   ├── bigquery/         # BigQuery client and utilities
│   │   ├── rule-engine/      # Natural language to SQL converter
│   │   ├── formatter/        # Result formatting
│   │   └── supabase/         # Supabase client
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Helper functions
├── public/                    # Static assets (logo, images)
├── supabase/                 # Database migrations
└── docs/                     # Additional documentation
```

 Configuration

 BigQuery Connection

The app connects to BigQuery using a service account. Here's how it works:

1. You provide a service account JSON key in the environment variables
2. The app initializes a BigQuery client with these credentials
3. When you ask a question, the app generates SQL and executes it
4. Results are formatted and displayed in the UI

Security Note: Never commit your `.env.local` file to Git. It's already in `.gitignore`.

Supabase Schema

The app uses these main tables:
- `users` - User accounts (managed by Supabase Auth)
- `projects` - User's analytics projects
- `datasets` - BigQuery dataset connections
- `chats` - Chat sessions
- `messages` - Individual chat messages

 Customization

 Changing the Theme

The app uses Tailwind CSS with a custom black/white premium theme. You can customize colors in `tailwind.config.ts`:

```typescript
colors: {
  primary: '#09090b',    // Main black
  secondary: '#27272a',  // Dark gray
  // ... add your colors
}
```

 Adding New Query Patterns

To add support for new types of questions, edit `src/lib/rule-engine/query-builder.ts`:

```typescript
// Add your pattern matching logic here
if (question.includes('your pattern')) {
  return buildYourQuery(tableName, schema);
}
```

 Deployment
Deploy to Vercel

The easiest way to deploy is using Vercel:
1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel's dashboard
4. Deploy!

Vercel will automatically detect Next.js and configure everything for you.

 Environment Variables for Production
Make sure to set all the same environment variables from `.env.local` in your Vercel project settings.

 Troubleshooting
"Cannot connect to BigQuery"
- Check that your service account JSON is valid
- Ensure the service account has BigQuery Data Viewer and Job User roles


- Verify the project ID matches your GCP project
 "No dataset linked"
- Make sure you've linked a BigQuery dataset to your project
- Check that the dataset and table exist in BigQuery
- Verify the table has data

 "Authentication failed"
- Clear your browser cookies and try logging in again
- Check that your Supabase environment variables are correct
- Make sure you've run the database migrations

 Additional Documentation
- [Architecture Overview](./docs/architecture.md) - System design and data flow
- [BigQuery Setup Guide](./docs/bigquery-setup.md) - Detailed BigQuery configuration
- [Rule Engine](./docs/rule-engine.md) - How the NL to SQL conversion works
- [Auth Troubleshooting](./docs/auth-troubleshooting.md) - Common auth issues

 Contributing
This is a personal project, but suggestions are welcome! Feel free to:
- Open an issue for bugs or feature requests
- Fork the repo and submit a pull request
- Share your ideas in the discussions

 License
MIT License - feel free to use this project for learning or building your own tools.

 Acknowledgments
Built with:
- [Next.js](https://nextjs.org/) - The React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Google BigQuery](https://cloud.google.com/bigquery) - Data warehouse
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vercel](https://vercel.com/) - Hosting
