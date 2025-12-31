# Mingming Kanban Deployment Guide

## 🚀 Architecture Analysis
Good news: **You do not have a separate backend.**
This project is a **Monolithic Next.js Application**.
- **Frontend:** React/Next.js (App Router & Pages Router)
- **Backend:** Next.js API Routes (`src/pages/api`)
- **Database:** PostgreSQL (via Sequelize)

**What this means:**
When you deploy this repo to Vercel, you are deploying **BOTH** the frontend and the backend simultaneously. You don't need to find a "lost" backend server. It's right here in the code.

## 🛠️ Redeployment Steps

### 1. Database Setup (Required)
Since you likely lost the old database connection, you need a new PostgreSQL instance.
**Recommendation:** Use **Vercel Postgres** (easiest) or **Neon** (Free Tier).

1.  Create a new Postgres database.
2.  Get the connection details (Host, User, Password, Database Name).

### 2. Environment Variables
You must set these in your Vercel Project Settings:

| Variable | Value |
|----------|-------|
| `APP_ENV` | `production` |
| `GEMINI_API_KEY` | *(Your Google Gemini API Key)* |

**Note:** The code has been updated to automatically detect Vercel/Neon variables (`POSTGRES_HOST`, `POSTGRES_USER`, etc.). You do **not** need to manually set `DB_HOST` etc. if you are using the Vercel Postgres integration.

### 3. Build Command
Vercel should auto-detect Next.js, but ensure your Build Command runs migrations if possible, or run them manually locally against the production DB.

**Standard Build Command:**
`next build`

**Migration Strategy:**
Since `package.json` has `"start": "npx sequelize-cli db:migrate && next start"`, Vercel might not run the migration on *deploy* (it runs on *start*).
- **Option A (Safe):** Connect to the prod DB from your local machine and run `npx sequelize-cli db:migrate`.
- **Option B (Vercel):** Override the Install Command to: `npm install && npx sequelize-cli db:migrate` (Note: this might fail if env vars aren't available during build).

## 📝 Summary
1.  **Deploy this repo to Vercel.**
2.  **Add the Env Vars.**
3.  **The "Backend" is now live.**
