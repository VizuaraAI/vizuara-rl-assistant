# 🚀 Complete Bootcamp Setup Guide

> **Simple 3-step process:** Setup Supabase → Fill Template → Give to Claude

---

## 📋 STEP 1: Pre-Setup (Do This First - 20 minutes)

### 1.1 Create New Supabase Project

1. **Go to:** https://supabase.com/dashboard
2. **Click:** "New Project"
3. **Fill in:**
   - Organization: [Select your org]
   - Name: `vizuara-[bootcamp-name]-assistant` (e.g., `vizuara-nlp-assistant`)
   - Database Password: **[Generate strong password and SAVE IT]**
   - Region: Choose closest to users (e.g., `us-east-1` or `ap-northeast-2`)
4. **Click:** "Create new project"
5. **Wait:** 2-3 minutes for setup

### 1.2 Create Storage Buckets (All Public)

**Go to:** Storage → Click "New bucket" and create these **3 buckets**:

1. **Bucket name:** `documents`
   - ✅ Check "Public bucket"
   - Click "Create bucket"

2. **Bucket name:** `roadmaps`
   - ✅ Check "Public bucket"
   - Click "Create bucket"

3. **Bucket name:** `notebooks`
   - ✅ Check "Public bucket"
   - Click "Create bucket"

**✅ You should now see 3 public buckets**

### 1.3 Get Supabase Credentials

**Go to:** Project Settings (gear icon) → API

**Copy and save these:**

```
PROJECT URL: https://[your-ref].supabase.co
ANON PUBLIC KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE ROLE KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Go to:** Project Settings → Database

**Copy this connection string:**

```
CONNECTION STRING (Session Pooler):
postgresql://postgres.[REF]:[PASSWORD]@aws-[REGION].pooler.supabase.com:5432/postgres
```

**⚠️ Replace `[PASSWORD]` with your actual database password!**

### 1.4 Run Database Migrations

**Go to:** SQL Editor → New Query

**Paste this SQL and click RUN:**

```sql
-- Migration 0001: Create Schema
-- This creates all tables for the bootcamp

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

-- Memory table
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

-- Roadmaps table
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  content JSONB NOT NULL,
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_mentor_id ON students(mentor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_student_id ON conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_student_id ON progress(student_id);
CREATE INDEX IF NOT EXISTS idx_memory_student_id ON memory(student_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_student_id ON roadmaps(student_id);
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON documents(student_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies (allow service role full access)
CREATE POLICY "Service role full access on users" ON users FOR ALL USING (true);
CREATE POLICY "Service role full access on students" ON students FOR ALL USING (true);
CREATE POLICY "Service role full access on conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Service role full access on messages" ON messages FOR ALL USING (true);
CREATE POLICY "Service role full access on progress" ON progress FOR ALL USING (true);
CREATE POLICY "Service role full access on memory" ON memory FOR ALL USING (true);
CREATE POLICY "Service role full access on roadmaps" ON roadmaps FOR ALL USING (true);
CREATE POLICY "Service role full access on documents" ON documents FOR ALL USING (true);

-- Storage policies for public buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('roadmaps', 'roadmaps', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('notebooks', 'notebooks', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public read documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Public insert documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Public update documents" ON storage.objects FOR UPDATE USING (bucket_id = 'documents');
CREATE POLICY "Public delete documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents');

CREATE POLICY "Public read roadmaps" ON storage.objects FOR SELECT USING (bucket_id = 'roadmaps');
CREATE POLICY "Public insert roadmaps" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'roadmaps');
CREATE POLICY "Public update roadmaps" ON storage.objects FOR UPDATE USING (bucket_id = 'roadmaps');
CREATE POLICY "Public delete roadmaps" ON storage.objects FOR DELETE USING (bucket_id = 'roadmaps');

CREATE POLICY "Public read notebooks" ON storage.objects FOR SELECT USING (bucket_id = 'notebooks');
CREATE POLICY "Public insert notebooks" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'notebooks');
CREATE POLICY "Public update notebooks" ON storage.objects FOR UPDATE USING (bucket_id = 'notebooks');
CREATE POLICY "Public delete notebooks" ON storage.objects FOR DELETE USING (bucket_id = 'notebooks');
```

**✅ Success! You should see "Success. No rows returned"**

**Verify:** Go to Table Editor - you should see 8 tables (users, students, conversations, messages, progress, memory, roadmaps, documents)

### 1.5 Gather API Keys

**Get these API keys ready:**

**Gemini API (for AI responses):**
- Go to: https://aistudio.google.com/app/apikey
- Click "Create API key"
- Copy it: `AIzaSy...`

**Brevo API (for emails):**
- Go to: https://app.brevo.com
- Login → SMTP & API → API Keys
- Create new or copy existing
- Copy it: `xkeysib-...`

**OpenAI API (optional, for future features):**
- Go to: https://platform.openai.com/api-keys
- Create new API key
- Copy it: `sk-proj-...`

---

## 📝 STEP 2: Fill Out Bootcamp Template (30 minutes)

Copy this template and fill in ALL sections:

```markdown
🚀 BOOTCAMP CLONING PROMPT

Hello, I want to create a new bootcamp from the Vizuara RL Assistant codebase.

GitHub: https://github.com/VizuaraAI/vizuara-rl-assistant

---

### BOOTCAMP DETAILS

**Bootcamp Name:** [e.g., "Natural Language Processing Bootcamp"]

**Mentor Persona:**
- Name: [e.g., "Dr. Sarah Chen"]
- Email: [e.g., "sarahchen@vizuara.com"]
- Title: [e.g., "PhD Stanford"]
- Background: [e.g., "Expert in NLP, Transformers, Large Language Models"]

**Phase I Curriculum** (Video lectures, ~X weeks):

[Paste your week-by-week curriculum here]

Week 1: [Topic Name]
[Description]
Key Topics:
- [Topic 1]
- [Topic 2]
- [Topic 3]

Week 2: [Topic Name]
...

[Continue for all weeks]

**Phase I Duration:** [e.g., "7 weeks"]

**Phase II Research Topics** (Research projects, ~X months):

[List research categories and subtopics]

1. [Category 1]: [Subtopic A, Subtopic B, Subtopic C]
2. [Category 2]: [Subtopic A, Subtopic B, Subtopic C]
...

[Aim for 6-12 categories with 3-5 subtopics each]

**Target Conferences:** [e.g., "ACL, EMNLP, NAACL, COLING"]

**Total Duration (Phase 1 + 2):** [e.g., "4 months"]

**Course Access URL:** [e.g., "https://vizuara.ai/courses/course_12345" or "N/A"]

---

### WELCOME EMAIL (sent when student is onboarded)

[Write your custom welcome email here, or leave blank to use default]

Example:
```
Hello,

Welcome to the [Bootcamp Name] research bootcamp. I am sending this email to you to make sure you know how your next [X] weeks look like.

The [Bootcamp Name] Research Bootcamp is divided into two phases. Phase 1 includes self-paced videos covering [brief description of Phase 1 content].

Phase II includes research guidance, which starts from identifying the problem statement to writing your research paper.

You can access the bootcamp material here: [COURSE_URL]

Please check this dashboard frequently for my announcements.

If you have any questions feel free to contact me.
```

---

### ONBOARDING MESSAGE (first message student sees when they login)

[Write your custom onboarding message, or leave blank to use default]

Example:
```
Hi,

Welcome to the [Bootcamp Name].

Please note the following points:

1) We will allocate ~[X weeks] for you to go through the foundational material.

2) Whenever you face any doubts or queries, ask on this platform.

3) After going through the foundations, the remaining ~[X months] will be spent on research.

This is a [total duration] program starting today.

Let's get started :)
```

---

### DEPLOYMENT

**Railway Project Name:** [e.g., "vizuara-nlp-assistant"]

**GitHub Repo Name:** [e.g., "VizuaraAI/vizuara-nlp-assistant"]

---

### SUPABASE CREDENTIALS (from Step 1)

**Database URLs:**
- Connection String: postgresql://postgres.[REF]:[PASSWORD]@aws-[REGION].pooler.supabase.com:5432/postgres

**API Keys:**
- Project URL: https://[REF].supabase.co
- Anon Public Key: eyJhbGci...
- Service Role Key: eyJhbGci...

**Database Password:** [your-password]

---

### API KEYS (from Step 1)

- OPENAI_API_KEY: sk-proj-...
- GEMINI_API_KEY: AIzaSy...
- BREVO_API_KEY: xkeysib-...

---

Please:
1. Update all code files to match this new bootcamp
2. Update mentor persona throughout
3. Update Phase I curriculum content
4. Update Phase II research topics
5. Update email templates
6. Update admin onboarding message
7. Commit and push to GitHub
8. Provide Railway environment variables list
```

**Save this filled template** - you'll paste it to Claude in Step 3.

---

## 🤖 STEP 3: Give to Claude (5 minutes)

**Open Claude Code and paste:**

```
I have set up a new Supabase project and want to convert this codebase to a new bootcamp.

[PASTE YOUR FILLED TEMPLATE FROM STEP 2]
```

**Claude will automatically:**
- ✅ Update all 15+ code files
- ✅ Update system prompts with new mentor/curriculum
- ✅ Update UI components (admin, student, mentor pages)
- ✅ Update email templates
- ✅ Update curriculum files
- ✅ Update configuration files
- ✅ Update tests
- ✅ Commit and push to GitHub

**Claude will then provide you with:**
- ✅ Railway environment variables (exact list to set)
- ✅ Deployment verification steps

---

## 🔧 STEP 4: Railway Setup (10 minutes)

After Claude finishes, set up Railway:

### 4.1 Create Railway Project

1. **Go to:** https://railway.app
2. **Login** with GitHub
3. **Click:** "New Project" → "Deploy from GitHub repo"
4. **Select:** Your repository (e.g., `VizuaraAI/vizuara-nlp-assistant`)
5. **Click:** "Deploy Now"

### 4.2 Set Environment Variables

**Go to:** Railway Dashboard → Your Project → Variables

**Click "New Variable" and add EXACTLY these (replace with your values):**

```bash
# Database (from Supabase)
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-[REGION].pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-[REGION].pooler.supabase.com:5432/postgres

# Supabase API
NEXT_PUBLIC_SUPABASE_URL=https://[REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# AI APIs
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIzaSy...

# Email (Brevo)
BREVO_API_KEY=xkeysib-...
BREVO_FROM_EMAIL=[your-mentor-email]
BREVO_FROM_NAME=[your-mentor-name]

# Environment
NODE_ENV=production
PORT=8080
```

**⚠️ IMPORTANT:**
- Replace `[REF]`, `[PASSWORD]`, `[REGION]` with your Supabase values
- Replace `[your-mentor-email]` with actual mentor email (e.g., sarahchen@vizuara.com)
- Replace `[your-mentor-name]` with actual mentor name (e.g., Dr Sarah Chen)

### 4.3 Configure Domain

1. **Go to:** Settings → Networking
2. **Port:** Should auto-detect as `8080` (if not, set it)
3. **Generate Domain:** Railway will give you a URL like:
   - `https://vizuara-nlp-assistant-production.up.railway.app`
4. **Copy this URL** - this is your production URL

### 4.4 Deploy

1. **Click:** "Redeploy" if needed
2. **Wait:** 2-3 minutes for build and deployment
3. **Check:** Deployment logs for "✓ Ready in XXXms"

---

## ✅ STEP 5: Verify (15 minutes)

### Test Admin Dashboard

1. **Go to:** `https://[your-railway-url]/admin`
2. **Create test student:**
   - Name: Test Student
   - Email: test@example.com
   - Today's date
3. **Verify:**
   - ✅ Welcome email preview shows CORRECT bootcamp name
   - ✅ Shows CORRECT mentor name
   - ✅ Password generated
4. **Click:** "Send Welcome Email" (optional - tests Brevo)

### Test Student Portal

1. **Go to:** `https://[your-railway-url]/student`
2. **Login:**
   - Email: test@example.com
   - Password: [from admin]
3. **Verify:**
   - ✅ Header shows CORRECT bootcamp name
   - ✅ Onboarding message shows CORRECT content
   - ✅ Onboarding message shows CORRECT phase durations
4. **Ask question:** "What topics are covered in Week 1?"
5. **Wait 30-60 seconds for AI response**
6. **Verify:**
   - ✅ AI responds with CORRECT curriculum topics
   - ✅ No mentions of old bootcamp

### Test Mentor Dashboard

1. **Go to:** `https://[your-railway-url]/mentor`
2. **Login:** (You'll need to create mentor account - see below)
3. **Verify:**
   - ✅ Header shows CORRECT mentor name
   - ✅ Draft appears for test student's question
   - ✅ Can approve draft successfully

**To create mentor account, run this in Supabase SQL Editor:**

```sql
INSERT INTO users (id, name, email, password_hash, role) VALUES
  ('00000000-0000-0000-0000-000000000001',
   '[YOUR MENTOR NAME]',
   '[YOUR MENTOR EMAIL]',
   '$2a$10$8K1p/a0dR1xqM8K3hM8ui.MhXKs2B.CjYcM0TzHlQvDjHTSJWKJYm',
   'mentor')
ON CONFLICT (email) DO NOTHING;
```
(Password will be: `mentor123`)

---

## 🎯 Complete Checklist

- [ ] **Supabase:** Project created, buckets created (3), migrations run (8 tables), credentials saved
- [ ] **Template:** Filled out completely with curriculum and research topics
- [ ] **Claude:** Converted all code, committed, pushed
- [ ] **Railway:** Environment variables set (11 variables), deployed successfully
- [ ] **Testing:** Admin works, student works, mentor works, AI responds correctly
- [ ] **Verification:** No references to old bootcamp anywhere

---

## 🐛 Troubleshooting

**Issue: Railway deployment fails**
- Check all 11 environment variables are set
- Check DATABASE_URL has password replaced (not `[PASSWORD]`)
- Check build logs for specific error

**Issue: Database connection fails**
- Verify DATABASE_URL copied exactly from Supabase
- Verify password replaced in connection string
- Check Supabase project is active (not paused)

**Issue: AI returns 403 Forbidden**
- Gemini API key is invalid or leaked
- Generate NEW key at https://aistudio.google.com/app/apikey
- Update GEMINI_API_KEY in Railway
- Click "Redeploy"

**Issue: Welcome email not sending**
- Check BREVO_API_KEY is valid
- Check BREVO_FROM_EMAIL is verified in Brevo dashboard
- Go to Brevo → Senders → Verify your email if needed

**Issue: Student sees old bootcamp message**
- Shouldn't happen with fresh database
- If it does, run: `DELETE FROM messages WHERE role = 'agent';` in Supabase SQL Editor

---

## ⏱️ Total Time: 2 Hours

| Step | Time |
|------|------|
| 1. Pre-Setup (Supabase + APIs) | 20 min |
| 2. Fill Template | 30 min |
| 3. Give to Claude (Claude works) | 15 min |
| 4. Railway Setup | 10 min |
| 5. Verify | 15 min |
| **TOTAL** | **~2 hours** |

---

## 🎉 Success!

Your new bootcamp is live! Students can now:
- ✅ Be onboarded by admin
- ✅ Receive welcome emails
- ✅ Login and see onboarding message
- ✅ Ask questions and get AI responses
- ✅ Get personalized mentorship

**Next steps:**
- Change mentor password: Run UPDATE query in Supabase
- Add real students via admin dashboard
- Monitor Railway logs for any issues
- Test all features thoroughly before announcing

---

## 📞 Quick Reference

**Admin URL:** `https://[railway-url]/admin`
**Student URL:** `https://[railway-url]/student`
**Mentor URL:** `https://[railway-url]/mentor`

**Supabase Dashboard:** https://supabase.com/dashboard
**Railway Dashboard:** https://railway.app
**Gemini API Keys:** https://aistudio.google.com/app/apikey
**Brevo Dashboard:** https://app.brevo.com
