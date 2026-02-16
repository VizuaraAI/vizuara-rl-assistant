# Bootcamp Conversion Checklist

> **Purpose:** Convert this codebase from one bootcamp (e.g., CV) to another (e.g., RL, NLP, etc.)
>
> **⚠️ CRITICAL:** Follow this checklist sequentially to avoid issues. Each section includes common mistakes to avoid.

---

## Prerequisites

- [ ] **Gather all bootcamp details:**
  - Bootcamp name (e.g., "Reinforcement Learning Bootcamp")
  - Mentor persona (name, email, title, background, expertise)
  - Phase I duration (in weeks)
  - Phase I curriculum (week-by-week topics with descriptions)
  - Phase II research topics (categories and subtopics)
  - Phase II duration (in months)
  - Total program duration (Phase I + Phase II)
  - Target conferences
  - Course access URL (if applicable)

---

## Section 1: System Prompts & Agent Persona

### 1.1 Update Core Persona

**File:** `src/services/agent/prompts/system.ts`

- [ ] Line 6: Update mentor name in `DR_RAJAT_PERSONA` (or rename variable)
- [ ] Line 6: Update bootcamp name
- [ ] Line 90: Update bootcamp name in redirect message
- [ ] Lines 165-167: Update Phase I description with new curriculum
- [ ] Lines 178-229: Update PHASE1_INSTRUCTIONS with new curriculum weeks/topics
- [ ] Lines 234-281: Update PHASE2_INSTRUCTIONS with new research categories

**⚠️ Common Mistakes:**
- Forgetting to update both the persona description AND the phase instructions
- Not updating the bootcamp name in ALL mentions (search for old bootcamp name)

### 1.2 Update Phase-Specific Prompts

**File:** `src/services/agent/prompts/phase1.ts`

- [ ] Update any phase1-specific guidance or curriculum references

**File:** `src/services/agent/prompts/phase2.ts`

- [ ] Update research topic categories
- [ ] Update conference list

---

## Section 2: UI Components

### 2.1 Admin Dashboard

**File:** `src/app/admin/page.tsx`

- [ ] Line 156: Update subtitle text (e.g., "RL Bootcamp - Student Onboarding")
- [ ] Lines 323-337: Update email preview template
  - Bootcamp name
  - Login URL
  - Mentor name and email
- [ ] Search for old bootcamp name throughout file

**⚠️ Common Mistakes:**
- Missing the email preview text (lines 323-337)
- Not updating the header subtitle

### 2.2 Student Portal

**File:** `src/app/student/page.tsx`

- [ ] Line 470: Update header title (e.g., "Vizuara Reinforcement Learning Bootcamp")
- [ ] Line 629: Update mentor name in compose view ("Dr. Rajat Dandekar")
- [ ] Line 766: Update mentor name in message headers

**⚠️ Common Mistakes:**
- Updating header but forgetting the compose view and message headers
- These appear in multiple places - use find & replace

### 2.3 Mentor Dashboard

**File:** `src/app/mentor/page.tsx`

- [ ] Line 1236: Update mentor name in header
- [ ] Line 1623: Update mentor name in message view

**File:** `src/app/dashboard/page.tsx`

- [ ] Search and replace old mentor/bootcamp names

### 2.4 Landing Page

**File:** `src/app/page.tsx`

- [ ] Update all bootcamp references
- [ ] Update mentor name mentions
- [ ] Update program description

### 2.5 Login Page

**File:** `src/app/login/page.tsx`

- [ ] Update page title/branding if needed

---

## Section 3: Email Templates

### 3.1 Welcome Email Service

**File:** `src/services/email/send-email.ts`

- [ ] Line 29: Update bootcamp name in email content
- [ ] Line 41: Update mentor name and email signature
- [ ] Line 44: Update sender email (BREVO_FROM_EMAIL)
- [ ] Line 45: Update sender name (BREVO_FROM_NAME)
- [ ] Line 74: Update email subject line

**⚠️ CRITICAL:**
- This is what students receive via email - double-check everything!

### 3.2 Onboarding Welcome Message

**File:** `src/app/api/admin/onboard/route.ts`

- [ ] Lines 108-122: Update welcome message that appears in student's first login
  - Bootcamp name
  - Program structure
  - Duration details
  - Dates

**⚠️ Common Mistakes:**
- This is different from the EMAIL - it's the in-app welcome message
- Old messages may persist in database (see Section 8)

---

## Section 4: Curriculum Content

### 4.1 Phase I Video Catalog

**File:** `resources/phase1-videos/video-catalog.md`

- [ ] Line 1: Update title (e.g., "Reinforcement Learning Bootcamp - Phase I Curriculum")
- [ ] Line 3: Update duration and lecture count
- [ ] Lines 5+: Replace entire curriculum with new weeks/topics
- [ ] Bottom: Update course access URL

**⚠️ CRITICAL:**
- This is what the AI agent uses to answer student questions about videos
- Must match your actual video curriculum exactly

### 4.2 Phase II Research Topics

**File:** `resources/phase2-topics/topics.md`

- [ ] Line 1: Update title
- [ ] Lines 3-5: Update description and philosophy
- [ ] Lines 9+: Replace all research categories and subtopics
- [ ] Bottom: Update target conferences list

**⚠️ CRITICAL:**
- Agent uses this to help students select research topics
- Make sure topics are realistic and achievable in 2-3 months

### 4.3 Resources Index Metadata

**File:** `resources/index.json`

- [ ] Line 52: Update video catalog title
- [ ] Lines 57-68: Update topics list to match new curriculum
- [ ] Line 127: Update Phase II topics title
- [ ] Lines 131-143: Update research category list

**⚠️ Common Mistakes:**
- Forgetting to update this file (I missed it initially!)
- This is used by the agent for fast lookups

---

## Section 5: Database & Seed Data

### 5.1 Update Seed Script

**File:** `src/scripts/seed.ts`

- [ ] Line 50: Update mentor name
- [ ] Line 51: Update mentor email
- [ ] Lines 128, 474: Update sample research topics for Phase II students
- [ ] Lines 164-333: Update sample messages to match new bootcamp context
- [ ] Lines 344-434: Update memory entries to match new topics

**⚠️ CRITICAL:**
- These create test students - update ALL sample content
- Old bootcamp references in messages will confuse testing

### 5.2 Update Migration Files

**File:** `src/db/migrations/0002_seed_data.sql`

- [ ] Line 7: Update mentor name and email
- [ ] Line 56: Update sample research topic

**⚠️ Common Mistakes:**
- Migration files are run on fresh databases - must be correct

### 5.3 Clean Production Database

**⚠️ MOST CRITICAL SECTION - THIS IS WHERE I MADE MAJOR MISTAKES**

**Problem:** Old bootcamp messages persist in production database and show up for new students.

**Solution Options:**

**Option A: Clear Messages Table (Recommended for conversion)**
```sql
-- Run in Supabase SQL Editor
DELETE FROM messages WHERE role = 'agent' AND content LIKE '%Computer Vision%';
DELETE FROM messages WHERE role = 'agent' AND content LIKE '%ML-DL%';
-- Repeat for any old bootcamp references
```

**Option B: Create New Project**
- Safer if you have production students
- Create fresh Supabase project
- Run migrations from scratch
- Update DATABASE_URL in Railway

**Option C: Selective Cleanup**
- Export student data you want to keep
- Delete old messages
- Import student data back

**⚠️ Lessons Learned:**
- I didn't realize there was OLD ML-DL bootcamp data in the database
- Students saw "Welcome to ML-DL Bootcamp" because of old database records
- Code was correct, but database had stale data
- ALWAYS check database contents, not just code!

---

## Section 6: Configuration Files

### 6.1 Update Package.json

**File:** `package.json`

- [ ] Line 2: Update project name (e.g., "vizuara-rl-teaching-assistant")
- [ ] Line 3: Update version to 0.1.0 for new bootcamp

### 6.2 Update README

**File:** `README.md`

- [ ] Update title and description
- [ ] Update mentor name
- [ ] Update curriculum overview
- [ ] Update feature list if bootcamp-specific features differ

### 6.3 Update CLAUDE.md

**File:** `CLAUDE.md`

- [ ] Lines 1-20: Update project description
- [ ] Lines 22-30: Update mentor persona details
- [ ] Lines 32-140: Update Phase I curriculum (all weeks and topics)
- [ ] Lines 142-155: Update Phase II research topics
- [ ] Line 157: Update target conferences
- [ ] Lines 162-240: Update welcome email text
- [ ] Update example messages throughout

**⚠️ CRITICAL:**
- This is Claude's instruction manual for the project
- Affects how Claude Code helps you maintain the project

### 6.4 Update .env.example

**File:** `.env.example`

- [ ] Line 21: Update BREVO_FROM_EMAIL to mentor email
- [ ] Line 22: Update BREVO_FROM_NAME to mentor name

---

## Section 7: Test Files

### 7.1 E2E Tests

**File:** `tests/e2e/ui-gmail-style.spec.ts`

- [ ] Line 43: Update expected bootcamp name in header test
- [ ] Line 62: Update expected mentor name
- [ ] Line 78: Update expected mentor name
- [ ] Line 90: Update expected mentor name
- [ ] Line 106: Update expected mentor name

**⚠️ Common Mistakes:**
- Tests will fail if you don't update expected text
- Update ALL mentor name references (I missed some initially)

### 7.2 Unit Tests

**File:** `src/services/agent/prompts/system.test.ts`

- [ ] Update any test assertions that check for bootcamp-specific content

---

## Section 8: API Routes & Services

### 8.1 Engagement/Follow-up Routes

**File:** `src/app/api/engagement/generate-followup/route.ts`

- [ ] Search for old mentor name references
- [ ] Update any bootcamp-specific follow-up content

**File:** `src/app/api/engagement/send-voice-note/route.ts`

- [ ] Update voice note context if needed

### 8.2 Mentor Routes

**File:** `src/app/api/mentor/send-message/route.ts`

- [ ] Search for mentor name references

**File:** `src/app/api/mentor/generate-roadmap-stream/route.ts`

- [ ] Update mentor name in roadmap generation

**File:** `src/app/api/mentor/find-conferences/route.ts`

- [ ] Update target conferences list if different

### 8.3 Agent Tools

**File:** `src/services/agent/tools/roadmap.ts`

- [ ] Update mentor name in roadmap templates
- [ ] Update research categories if roadmap structure differs

**File:** `src/services/agent/tools/voice-notes.ts`

- [ ] Update voice notes directory structure if needed

---

## Section 9: Resources & Assets

### 9.1 Replace Resource Files

**Phase I Voice Notes:** `resources/phase1-voice-notes/`
- [ ] Replace with new bootcamp-specific voice notes
- [ ] Update filenames if needed
- [ ] Update `resources/index.json` with new file metadata

**Phase II Voice Notes:** `resources/phase2-voice-notes/`
- [ ] Replace with new bootcamp-specific voice notes

**Sample Roadmaps:** `resources/phase2-roadmaps/`
- [ ] Replace with new bootcamp-specific roadmap examples (PDFs)
- [ ] These serve as templates for AI-generated roadmaps

**Sample Papers:** `resources/sample-papers/`
- [ ] Replace with papers relevant to new bootcamp domain
- [ ] Students see these as examples of publishable work

**Manuscript Templates:** `resources/manuscript-templates/`
- [ ] Verify template is domain-appropriate
- [ ] May be generic enough to reuse

### 9.2 Run Ingest Script

After updating all resources:
```bash
npm run ingest  # or use the /ingest skill
```

This updates `resources/index.json` with new metadata.

---

## Section 10: Environment Variables & Deployment

### 10.1 Update Railway Environment Variables

**Go to Railway Dashboard → Your Project → Variables**

Required variables:
- [ ] `GEMINI_API_KEY` - Generate NEW key (old ones may be leaked)
- [ ] `BREVO_API_KEY` - Email service key
- [ ] `BREVO_FROM_EMAIL` - Mentor email (e.g., rajatdandekar@vizuara.com)
- [ ] `BREVO_FROM_NAME` - Mentor name (e.g., Dr Rajat Dandekar)
- [ ] `DATABASE_URL` - Supabase connection string
- [ ] `DIRECT_URL` - Supabase direct connection
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

**⚠️ CRITICAL SECURITY:**
- NEVER commit API keys to git
- Use `.env.example` for documentation only
- DEPLOYMENT.md and similar files should be in `.gitignore`

### 10.2 Verify .gitignore

**File:** `.gitignore`

- [ ] Verify `.env` is excluded
- [ ] Add `DEPLOYMENT.md` (contains secrets)
- [ ] Add `check-students.js` or similar test scripts with credentials

**⚠️ Lessons Learned:**
- I tried to push DEPLOYMENT.md with API keys - GitHub blocked it!
- This caused the Gemini API key to be flagged as leaked
- Had to generate new API key and update Railway

### 10.3 Deploy & Test

- [ ] Commit all changes (ensure no secrets!)
- [ ] Push to GitHub
- [ ] Verify Railway auto-deploys
- [ ] Check deployment logs for errors
- [ ] Common deployment errors:
  - [ ] Build failures (check package.json)
  - [ ] Database connection failures (check env vars)
  - [ ] API key issues (check Railway variables)

---

## Section 11: Post-Deployment Verification

### 11.1 Admin Dashboard Test

- [ ] Go to `/admin`
- [ ] Create test student
- [ ] Verify welcome email shows CORRECT bootcamp name
- [ ] Verify email preview shows CORRECT mentor name
- [ ] Send welcome email and verify content

### 11.2 Student Portal Test

- [ ] Login as test student
- [ ] Verify header shows CORRECT bootcamp name
- [ ] Check first message (onboarding) - should show CORRECT bootcamp
- [ ] Ask a question about curriculum
- [ ] Verify AI response mentions CORRECT topics

**⚠️ CRITICAL CHECK:**
- If student sees OLD bootcamp message, database wasn't cleaned (Section 5.3)
- If AI mentions wrong topics, check system prompts (Section 1) and resources (Section 4)

### 11.3 Mentor Dashboard Test

- [ ] Login as mentor
- [ ] Verify header shows CORRECT mentor name
- [ ] View student's draft response
- [ ] Verify draft content is relevant to NEW bootcamp
- [ ] Approve draft and verify it appears correctly

### 11.4 AI Agent Functionality Test

**Phase I Student:**
- [ ] Ask about a specific lecture/topic
- [ ] Agent should reference correct video catalog
- [ ] Test voice note delivery
- [ ] Test progress tracking

**Phase II Student:**
- [ ] Ask about research topics
- [ ] Agent should reference correct Phase II topics
- [ ] Generate a roadmap
- [ ] Verify roadmap matches bootcamp domain
- [ ] Test conference finder

### 11.5 Check Railway Logs

**Look for these SUCCESS indicators:**
```
[Chat API] Student message saved immediately
[Chat API] Tools available: [correct tool list]
[Chat API] Sending to Gemini with X part(s)
[Chat API] Gemini response: XXXX chars, X tool calls
```

**Look for these ERROR indicators:**
```
[403 Forbidden] Your API key was reported as leaked  ❌
Failed to load memory context: Cannot read properties of null  ⚠️ (non-critical)
Direct PostgreSQL connection not available  ⚠️ (non-critical)
```

---

## Section 12: Common Mistakes Summary

### Mistakes I Made (Don't Repeat!)

1. **❌ Didn't check database for old content**
   - Students saw "ML-DL Bootcamp" message from old database records
   - Fix: Always clean database messages table (Section 5.3)

2. **❌ Committed secrets to git**
   - Tried to push DEPLOYMENT.md with API keys
   - GitHub blocked it, Gemini key got flagged as leaked
   - Fix: Add secrets files to .gitignore BEFORE committing

3. **❌ Missed resources/index.json metadata**
   - Agent had outdated topic metadata
   - Fix: Always update index.json when changing curriculum (Section 4.3)

4. **❌ Incomplete find & replace for mentor name**
   - Left "Dr. Sreedath Panat" and "Dr. Rajat Panat" in multiple files
   - Fix: Use global find & replace, check ALL files (Sections 2, 3, 8)

5. **❌ Forgot to update test files**
   - Tests failed because expected text didn't match
   - Fix: Update test expectations (Section 7)

6. **❌ Didn't verify Railway redeployment**
   - Changed code but Railway didn't auto-deploy
   - Fix: Always check Railway dashboard after pushing

7. **❌ Assumed database connection would work**
   - PostgreSQL connection failed, memory system broke
   - Fix: Verify all env vars are set in Railway (Section 10.1)

### Best Practices Going Forward

✅ **Always start with Prerequisites section** - gather ALL details before coding

✅ **Follow checklist sequentially** - don't skip around

✅ **Use find & replace for names** - search entire codebase

✅ **Check database contents** - don't assume it's clean

✅ **Test locally before deploying** - run `npm run build` locally

✅ **Clean up secrets** - review .gitignore before every commit

✅ **Verify Railway logs** - check for errors after each deployment

✅ **Create test students** - test both Phase I and Phase II flows

✅ **Document custom changes** - if you customize beyond this checklist, document it!

---

## Section 13: Time Estimates

| Section | Estimated Time |
|---------|---------------|
| 1. System Prompts | 30-45 min |
| 2. UI Components | 45-60 min |
| 3. Email Templates | 20-30 min |
| 4. Curriculum Content | 60-90 min (depending on complexity) |
| 5. Database & Seed | 45-60 min |
| 6. Configuration Files | 30-45 min |
| 7. Test Files | 20-30 min |
| 8. API Routes | 30-45 min |
| 9. Resources & Assets | 60-120 min (depends on new content) |
| 10. Deployment | 15-30 min |
| 11. Testing & Verification | 45-60 min |
| **TOTAL** | **6-9 hours** |

**Note:** First-time conversion will take longer. Subsequent conversions will be faster as you learn the codebase.

---

## Section 14: Quick Reference - Files to Update

### Critical Files (MUST UPDATE)

```
✅ src/services/agent/prompts/system.ts
✅ src/app/admin/page.tsx
✅ src/app/student/page.tsx
✅ src/app/mentor/page.tsx
✅ src/services/email/send-email.ts
✅ src/app/api/admin/onboard/route.ts
✅ resources/phase1-videos/video-catalog.md
✅ resources/phase2-topics/topics.md
✅ resources/index.json
✅ Database (clear old messages!)
```

### Important Files (SHOULD UPDATE)

```
⚠️ src/scripts/seed.ts
⚠️ src/db/migrations/0002_seed_data.sql
⚠️ package.json
⚠️ README.md
⚠️ CLAUDE.md
⚠️ tests/e2e/ui-gmail-style.spec.ts
⚠️ .env.example
⚠️ Railway environment variables
```

### Optional Files (UPDATE IF CUSTOMIZED)

```
ℹ️ src/app/page.tsx (landing page)
ℹ️ src/services/agent/tools/*.ts (if adding custom tools)
ℹ️ resources/ (voice notes, samples, templates)
```

---

## Section 15: Validation Checklist

Before marking conversion as COMPLETE, verify:

- [ ] Created test student via admin dashboard
- [ ] Welcome email received with CORRECT bootcamp name
- [ ] Student login shows CORRECT onboarding message
- [ ] Student asks question, AI responds with CORRECT curriculum references
- [ ] Mentor dashboard shows CORRECT mentor name
- [ ] Draft approval works correctly
- [ ] Phase II student can request roadmap for NEW bootcamp topics
- [ ] Generated roadmap is relevant to NEW bootcamp domain
- [ ] No references to OLD bootcamp name in any user-facing content
- [ ] Railway logs show no critical errors
- [ ] All tests pass: `npm run test`

---

## Appendix A: Emergency Rollback

If conversion fails in production:

1. **Immediate:** Revert Railway to previous deployment
   - Railway Dashboard → Deployments → Select previous → Redeploy

2. **Database:** Restore from backup if available
   - Supabase Dashboard → Database → Backups

3. **Code:** Git revert
   ```bash
   git log  # Find commit before conversion
   git revert <commit-hash>
   git push origin main
   ```

---

## Appendix B: Search Commands for Verification

**Find all references to old bootcamp name:**
```bash
cd /path/to/project
grep -r "Computer Vision" src/
grep -r "CV Bootcamp" src/
```

**Find all references to old mentor name:**
```bash
grep -r "Dr. Sreedath" src/
grep -r "sreedath@" src/
```

**Find hardcoded emails:**
```bash
grep -r "@vizuara.com" src/ | grep -v "example"
```

**Find API key references (should only be env vars):**
```bash
grep -r "AIza" src/  # Should return nothing!
grep -r "sk-" src/   # Should return nothing!
```

---

## Appendix C: Contact & Support

If you encounter issues not covered in this checklist:

1. Check Railway logs for specific error messages
2. Check Supabase logs for database errors
3. Review this checklist for missed steps
4. Search codebase for old bootcamp references
5. Test with a fresh test student

**Remember:** Most issues come from:
- Old database content (Section 5.3)
- Missing environment variables (Section 10.1)
- Incomplete find & replace (Sections 2, 3, 8)

---

**Last Updated:** Based on CV → RL conversion (February 2026)
**Next Update:** After next bootcamp conversion - document any new edge cases!
