# Complete New Bootcamp Setup Guide

> **Goal:** Set up a brand new bootcamp from scratch with fresh Supabase database, Railway deployment, and converted codebase.

---

## Overview: Your Work vs Claude's Work

### 🔵 YOUR WORK (Steps 1-3)
1. Create new Supabase project
2. Set up database (run SQL migrations)
3. Configure Railway and provide credentials to Claude

### 🟢 CLAUDE'S WORK (Step 4)
4. Convert all code automatically

### 🔵 YOUR WORK (Step 5)
5. Verify deployment and test

**Total time:** ~2 hours (30 min Supabase + 30 min filling template + 15 min Railway + Claude auto-converts + 30 min verification)

---

# STEP 1: SUPABASE SETUP (30 minutes)

## 1.1 Create New Supabase Project

1. **Go to:** https://supabase.com/dashboard
2. **Click:** "New Project"
3. **Fill in:**
   - **Organization:** Select your organization (or create new)
   - **Project Name:** `vizuara-[bootcamp-name]-assistant` (e.g., `vizuara-nlp-assistant`)
   - **Database Password:** Generate a strong password and **SAVE IT** (you'll need it later)
   - **Region:** Choose closest to your users (e.g., `us-east-1` or `europe-west`)
   - **Pricing Plan:** Select appropriate plan (Free tier OK for testing)

4. **Click:** "Create new project"
5. **Wait:** 2-3 minutes for project to initialize

---

## 1.2 Get Your Supabase Credentials

Once project is ready:

1. **Go to:** Project Settings (gear icon) → API

2. **Copy these credentials** (you'll give them to Claude later):

```
PROJECT URL: https://[your-project-ref].supabase.co
ANON PUBLIC KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE ROLE KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (⚠️ Keep secret!)
```

3. **Go to:** Project Settings → Database

4. **Copy these connection strings:**

```
CONNECTION STRING (URI):
postgresql://postgres.[project-ref]:[password]@aws-[region].pooler.supabase.com:5432/postgres

DIRECT CONNECTION (Session pooler):
postgresql://postgres.[project-ref]:[password]@aws-[region].pooler.supabase.com:5432/postgres
```

**⚠️ IMPORTANT:** Replace `[password]` in the connection strings with your actual database password from step 1.1

**Save all these credentials** - you'll provide them to Claude in Step 3.

---

## 1.3 Create Storage Buckets

Storage buckets are needed for file uploads (PDFs, images, documents, voice notes).

1. **Go to:** Storage (in left sidebar)

2. **Create "documents" bucket:**
   - Click "New Bucket"
   - Name: `documents`
   - Public bucket: **NO** (leave unchecked - private)
   - Click "Create bucket"

3. **Set up bucket policies:**
   - Click on `documents` bucket
   - Go to "Policies" tab
   - Click "New Policy" → "For full customization"
   - **Policy name:** `Allow authenticated uploads`
   - **Allowed operation:** `INSERT`, `SELECT`, `UPDATE`, `DELETE`
   - **Policy definition:**
   ```sql
   (bucket_id = 'documents'::text)
   ```
   - Target roles: `authenticated`
   - Click "Review" → "Save policy"

**✅ Buckets Created!**

---

## 1.4 Run Database Migrations

Now we'll create all the tables (users, students, conversations, messages, etc.)

### 1.4.1 Create Schema

1. **Go to:** SQL Editor (in left sidebar)

2. **Click:** "New Query"

3. **Copy this SQL** and paste it:

```sql
-- Migration 0001: Create Schema
-- This creates all tables for the bootcamp

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (mentors and students)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  preferred_name TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'mentor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES users(id),
  current_phase TEXT NOT NULL DEFAULT 'phase1' CHECK (current_phase IN ('phase1', 'phase2')),
  current_topic_index INTEGER DEFAULT 1,
  current_milestone INTEGER DEFAULT 0,
  research_topic TEXT,
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  phase1_start TIMESTAMPTZ,
  phase2_start TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'agent', 'mentor')),
  content TEXT NOT NULL,
  attachments JSONB,
  tool_calls JSONB,
  status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'approved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress tracking table
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('phase1', 'phase2')),
  topic_index INTEGER,
  milestone INTEGER,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory table (for student profiles and conversation memory)
CREATE TABLE IF NOT EXISTS memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('short_term', 'long_term', 'daily_note')),
  key TEXT,
  value JSONB,
  date DATE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Roadmaps table (Phase II research roadmaps)
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  content JSONB NOT NULL,
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table (uploaded files)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  uploader_email TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  mime_type TEXT NOT NULL,
  file_size_bytes INTEGER,
  document_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_mentor_id ON students(mentor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_student_id ON conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_student_id ON progress(student_id);
CREATE INDEX IF NOT EXISTS idx_memory_student_id ON memory(student_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_student_id ON roadmaps(student_id);
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON documents(student_id);

-- Row Level Security (RLS) - Enable it
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies (allow service role to do everything)
CREATE POLICY "Service role can do everything on users" ON users FOR ALL USING (true);
CREATE POLICY "Service role can do everything on students" ON students FOR ALL USING (true);
CREATE POLICY "Service role can do everything on conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Service role can do everything on messages" ON messages FOR ALL USING (true);
CREATE POLICY "Service role can do everything on progress" ON progress FOR ALL USING (true);
CREATE POLICY "Service role can do everything on memory" ON memory FOR ALL USING (true);
CREATE POLICY "Service role can do everything on roadmaps" ON roadmaps FOR ALL USING (true);
CREATE POLICY "Service role can do everything on documents" ON documents FOR ALL USING (true);
```

4. **Click:** "Run" (or press Cmd/Ctrl + Enter)

5. **Verify:** You should see "Success. No rows returned" (this is correct!)

6. **Check tables created:**
   - Go to "Table Editor" (in left sidebar)
   - You should see: `users`, `students`, `conversations`, `messages`, `progress`, `memory`, `roadmaps`, `documents`

**✅ Database Schema Created!**

---

## 1.5 Create Test Mentor Account

We'll create a mentor account manually (Claude will handle student accounts later)

1. **Go to:** SQL Editor → New Query

2. **Paste this SQL** (update the email/password if needed):

```sql
-- Create mentor account
-- Email: mentor@vizuara.com
-- Password: mentor123 (change this!)

INSERT INTO users (id, name, email, password_hash, role) VALUES
  ('00000000-0000-0000-0000-000000000001',
   '[YOUR_MENTOR_NAME]',  -- e.g., 'Dr. Sarah Chen'
   '[YOUR_MENTOR_EMAIL]',  -- e.g., 'sarahchen@vizuara.com'
   '$2a$10$8K1p/a0dR1xqM8K3hM8ui.MhXKs2B.CjYcM0TzHlQvDjHTSJWKJYm',  -- bcrypt hash of "mentor123"
   'mentor')
ON CONFLICT (email) DO NOTHING;
```

**⚠️ IMPORTANT:** Replace `[YOUR_MENTOR_NAME]` and `[YOUR_MENTOR_EMAIL]` with actual values!

3. **Click:** "Run"

**✅ Mentor Account Created!** (Login: your-email / Password: mentor123)

---

## 1.6 Verify Supabase Setup

**Check that everything is ready:**

- [x] Project created
- [x] Credentials copied
- [x] Storage bucket `documents` created with policies
- [x] Database schema created (8 tables)
- [x] Mentor account created

**If all checked, Supabase setup is COMPLETE!** ✅

---

# STEP 2: FILL OUT BOOTCAMP TEMPLATE (30 minutes)

1. **Open the template:** `NEW_BOOTCAMP_PROMPT_TEMPLATE.md` in this repo

2. **Fill in ALL sections:**
   - Bootcamp name and details
   - Mentor persona (name, email, credentials, background)
   - Phase I curriculum (week-by-week breakdown)
   - Phase II research topics (6-12 categories with subtopics)
   - Target conferences
   - Email templates (or use defaults)
   - Resources (voice notes, PDFs, etc.)

3. **Upload resource files** (if you have them):
   - Phase I voice notes → `resources/phase1-voice-notes/`
   - Phase II voice notes → `resources/phase2-voice-notes/`
   - Sample roadmap PDFs → `resources/phase2-roadmaps/`
   - Sample papers → `resources/sample-papers/`

4. **Save your filled template** - you'll paste it to Claude in Step 4

---

# STEP 3: RAILWAY SETUP & PROVIDE CREDENTIALS TO CLAUDE (15 minutes)

## 3.1 Create Railway Project (if new)

**If you already have a Railway project, skip to 3.2**

1. **Go to:** https://railway.app
2. **Login** with GitHub
3. **Click:** "New Project" → "Deploy from GitHub repo"
4. **Select:** Your forked `vizuara-rl-assistant` repository
5. **Click:** "Deploy Now"
6. **Wait** for initial deployment (will fail - that's OK, we're not configured yet)

## 3.2 Configure Environment Variables

1. **Go to:** Railway Dashboard → Your Project → Variables

2. **Click:** "New Variable" and add each of these:

### Database Variables (from Supabase Step 1.2):

```bash
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-[region].pooler.supabase.com:5432/postgres

DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-[region].pooler.supabase.com:5432/postgres

NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### AI API Variables:

**Gemini API Key:**
1. Go to: https://aistudio.google.com/app/apikey
2. Create new API key
3. Copy it and add to Railway:

```bash
GEMINI_API_KEY=AIzaSy...
```

### Email Variables (Brevo):

**Get Brevo API Key:**
1. Go to: https://app.brevo.com
2. Sign up / Login
3. Go to: SMTP & API → API Keys
4. Create new API key
5. Copy it and add to Railway:

```bash
BREVO_API_KEY=xkeysib-...

BREVO_FROM_EMAIL=[your-mentor-email]
# Example: sarahchen@vizuara.com

BREVO_FROM_NAME=[your-mentor-name]
# Example: Dr Sarah Chen
```

**⚠️ CRITICAL:** Make sure `BREVO_FROM_EMAIL` matches your mentor email from the template!

3. **Click:** "Redeploy" (if Railway asks)

## 3.3 Get Your Railway URL

1. **Go to:** Settings → Domains
2. **Copy your Railway URL:** `https://[project-name]-production.up.railway.app`
3. **Save it** - you'll need it in the template

---

## 3.4 Prepare Credentials for Claude

**Create a file with all your credentials** (you'll paste this to Claude):

```markdown
# CREDENTIALS FOR CLAUDE

## Supabase
- PROJECT_URL: https://[your-project-ref].supabase.co
- ANON_KEY: eyJhbGci...
- SERVICE_ROLE_KEY: eyJhbGci...
- CONNECTION_STRING: postgresql://postgres.[project-ref]:[password]@...

## Railway
- PRODUCTION_URL: https://[project-name]-production.up.railway.app

## Gemini
- API_KEY: AIzaSy... (already set in Railway)

## Brevo
- API_KEY: xkeysib-... (already set in Railway)
- FROM_EMAIL: [mentor-email]
- FROM_NAME: [mentor-name]

## Mentor Account (for testing)
- Email: [mentor-email]
- Password: mentor123
```

**⚠️ Keep this file PRIVATE** - it contains sensitive credentials!

---

# STEP 4: GIVE EVERYTHING TO CLAUDE (Claude's Work)

## 4.1 What You Give Claude

Open Claude Code and paste this message:

```markdown
I want to convert this codebase to a new bootcamp with a fresh Supabase database.

I have completed:
✅ Created new Supabase project
✅ Set up database schema (ran migrations)
✅ Created storage buckets
✅ Configured Railway environment variables
✅ Filled out bootcamp template

Here are my credentials:

[PASTE YOUR CREDENTIALS FROM STEP 3.4]

Here is my complete bootcamp information:

[PASTE YOUR FILLED TEMPLATE FROM STEP 2]

Please:
1. Convert ALL code files to the new bootcamp
2. Update system prompts, UI, emails, curriculum, tests
3. Commit and push changes to GitHub
4. Provide me with verification steps after Railway deploys
```

## 4.2 What Claude Will Do Automatically

Claude will:

1. ✅ Update `src/services/agent/prompts/system.ts` (agent persona & curriculum)
2. ✅ Update `src/app/admin/page.tsx` (admin dashboard)
3. ✅ Update `src/app/student/page.tsx` (student portal)
4. ✅ Update `src/app/mentor/page.tsx` (mentor dashboard)
5. ✅ Update `src/services/email/send-email.ts` (email templates)
6. ✅ Update `src/app/api/admin/onboard/route.ts` (onboarding message)
7. ✅ Update `resources/phase1-videos/video-catalog.md` (curriculum)
8. ✅ Update `resources/phase2-topics/topics.md` (research topics)
9. ✅ Update `resources/index.json` (metadata)
10. ✅ Update `src/scripts/seed.ts` (test data)
11. ✅ Update `src/db/migrations/0002_seed_data.sql` (seed SQL)
12. ✅ Update all configuration files (package.json, README, CLAUDE.md)
13. ✅ Update test files
14. ✅ Update all API routes with new mentor/bootcamp references
15. ✅ Commit all changes
16. ✅ Push to GitHub (triggers Railway deployment)

**Claude will tell you when it's done** and provide verification steps.

---

# STEP 5: VERIFY DEPLOYMENT (30 minutes)

After Claude finishes and Railway deploys, verify everything works:

## 5.1 Check Railway Deployment

1. **Go to:** Railway Dashboard → Deployments
2. **Verify:** Latest deployment shows "Success" ✅
3. **Check logs:** Look for:
   ```
   ✓ Starting...
   ✓ Ready in XXXms
   ```

## 5.2 Test Admin Dashboard

1. **Go to:** `https://[your-railway-url]/admin`
2. **Create test student:**
   - Name: Test Student
   - Email: test@example.com
   - Joining Date: Today
3. **Verify:**
   - ✅ Email preview shows CORRECT bootcamp name
   - ✅ Email preview shows CORRECT mentor name
   - ✅ Password generated successfully
4. **Optional:** Click "Send Welcome Email" to test Brevo integration

## 5.3 Test Student Portal

1. **Go to:** `https://[your-railway-url]/student`
2. **Login with test student:**
   - Email: test@example.com
   - Password: [generated password from admin]
3. **Verify:**
   - ✅ Header shows CORRECT bootcamp name
   - ✅ First message (onboarding) shows CORRECT bootcamp description
   - ✅ First message mentions CORRECT phase durations
4. **Send a test question:**
   - Ask: "What topics are covered in Week 1?"
   - Wait for AI response (30-60 seconds)
5. **Verify AI response:**
   - ✅ Mentions CORRECT curriculum topics
   - ✅ Sounds like your mentor persona
   - ✅ No references to old bootcamp

## 5.4 Test Mentor Dashboard

1. **Go to:** `https://[your-railway-url]/mentor`
2. **Login with mentor account:**
   - Email: [your mentor email]
   - Password: mentor123
3. **Verify:**
   - ✅ Header shows CORRECT mentor name
   - ✅ Test student appears in left sidebar
4. **Click on test student**
5. **Check Drafts tab:**
   - ✅ AI draft response appears
   - ✅ Draft content is relevant to new bootcamp
6. **Approve the draft**
7. **Verify:**
   - ✅ Message appears in student's inbox
   - ✅ Shows as "approved" status

## 5.5 Check Railway Logs

1. **Go to:** Railway → Logs
2. **Look for SUCCESS indicators:**
   ```
   [Chat API] Gemini response: XXXX chars, X tool calls ✅
   Email sent successfully via Brevo ✅
   ```
3. **Look for ERROR indicators:**
   ```
   [403 Forbidden] Your API key was reported as leaked ❌
   Failed to connect to database ❌
   ```

**If you see errors:** Check that all environment variables are set correctly in Railway

## 5.6 Test Phase II Features (Optional)

1. **Transition test student to Phase II:**
   - Mentor dashboard → Test student → "Transition to Phase II" button
2. **Generate roadmap:**
   - Click "Generate Roadmap"
   - Enter a research topic from your Phase II categories
   - Verify roadmap is generated with CORRECT bootcamp focus

---

# COMPLETE CHECKLIST

Before marking setup as COMPLETE, verify ALL:

## Supabase ✅
- [x] Project created
- [x] Credentials saved
- [x] Storage bucket `documents` created
- [x] Database schema created (8 tables visible in Table Editor)
- [x] Mentor account created

## Template ✅
- [x] All sections filled out completely
- [x] Curriculum has week-by-week breakdown
- [x] Research topics have 6-12 categories
- [x] Resource files uploaded (if applicable)

## Railway ✅
- [x] Project connected to GitHub repo
- [x] All environment variables configured:
  - [x] DATABASE_URL
  - [x] DIRECT_URL
  - [x] NEXT_PUBLIC_SUPABASE_URL
  - [x] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [x] SUPABASE_SERVICE_ROLE_KEY
  - [x] GEMINI_API_KEY
  - [x] BREVO_API_KEY
  - [x] BREVO_FROM_EMAIL
  - [x] BREVO_FROM_NAME
- [x] Deployment successful

## Claude Conversion ✅
- [x] Gave Claude credentials + filled template
- [x] Claude updated all files
- [x] Claude committed and pushed to GitHub
- [x] Railway auto-deployed successfully

## Testing ✅
- [x] Admin dashboard works
- [x] Test student created
- [x] Welcome email correct
- [x] Student portal shows correct bootcamp
- [x] Student onboarding message correct
- [x] AI responds with correct curriculum
- [x] Mentor dashboard shows correct mentor name
- [x] Draft approval works
- [x] No errors in Railway logs

---

# TROUBLESHOOTING

## Issue: Railway deployment fails

**Check:**
- Are all environment variables set?
- Is DATABASE_URL correct with password replaced?
- Check build logs for specific error

## Issue: Database connection fails

**Check:**
- Is Supabase project active?
- Is DATABASE_URL copied correctly from Supabase?
- Did you replace `[password]` with actual password?

## Issue: Gemini API returns 403 Forbidden

**Solution:**
- API key was leaked or invalid
- Generate NEW key at https://aistudio.google.com/app/apikey
- Update GEMINI_API_KEY in Railway
- Redeploy

## Issue: Student sees old bootcamp message

**Cause:** Old messages in database (shouldn't happen with fresh database)

**Solution:** Run this in Supabase SQL Editor:
```sql
DELETE FROM messages WHERE role = 'agent';
```

## Issue: Email not sending

**Check:**
- BREVO_API_KEY is valid
- BREVO_FROM_EMAIL matches a verified sender in Brevo
- Check Brevo dashboard for error logs

---

# ESTIMATED TIMELINE

| Step | Your Time | Claude Time | Total |
|------|-----------|-------------|-------|
| 1. Supabase Setup | 30 min | - | 30 min |
| 2. Fill Template | 30 min | - | 30 min |
| 3. Railway Setup | 15 min | - | 15 min |
| 4. Claude Conversion | 5 min | 10 min | 15 min |
| 5. Verification | 30 min | - | 30 min |
| **TOTAL** | **1h 50min** | **10 min** | **2 hours** |

---

# SUCCESS!

If all checks pass, your new bootcamp is LIVE! 🎉

Students can now:
- ✅ Be onboarded by admin
- ✅ Receive welcome emails
- ✅ Login to student portal
- ✅ Ask questions and get AI responses
- ✅ Get personalized mentorship from Dr. [Your Mentor]

Mentor can:
- ✅ Review and approve AI drafts
- ✅ Send direct messages
- ✅ Generate roadmaps
- ✅ Track student progress
- ✅ Transition students to Phase II

**You're ready to enroll students!** 🚀
