# New Bootcamp Creation Prompt Template

> **Instructions:** Fill out ALL sections below completely. Copy the entire filled template and paste it to Claude Code to automatically convert the codebase to your new bootcamp.

---

## BOOTCAMP DETAILS

**Bootcamp Name:** [e.g., "Natural Language Processing Bootcamp" or "MLOps Engineering Bootcamp"]

**Short Name/Abbreviation:** [e.g., "NLP" or "MLOps"]

**Total Duration:** [e.g., "4 months" or "16 weeks"]

**Phase I Duration:** [e.g., "7 weeks" or "2 months"]

**Phase II Duration:** [e.g., "3 months" or "10 weeks"]

---

## MENTOR PERSONA

**Full Name:** [e.g., "Dr. Sarah Chen"]

**Email:** [e.g., "sarahchen@vizuara.com"]

**Title/Credentials:** [e.g., "PhD Stanford"]

**Expertise:** [e.g., "Expert in NLP, Transformers, Large Language Models"]

**Background (2-3 sentences):** [e.g., "Published 15+ papers at ACL, EMNLP. Previously led NLP research at Google Brain. Specializes in multilingual models and low-resource languages."]

---

## PHASE I CURRICULUM

**Phase I Description:** [e.g., "Students watch pre-recorded video lectures covering NLP fundamentals, transformers, fine-tuning, and deployment"]

**Total Weeks:** [Number, e.g., "7"]

**Total Lectures:** [Number, e.g., "10"]

### Week-by-Week Breakdown:

**Week 1:**
- Lecture Title: [e.g., "Introduction to NLP & Text Processing"]
- Topics Covered: [e.g., "Tokenization, Text Preprocessing, Bag of Words, TF-IDF"]

- Lecture Title: [e.g., "Word Embeddings & Word2Vec"]
- Topics Covered: [e.g., "Word2Vec, GloVe, FastText, Embedding Visualization"]

**Week 2:**
- Lecture Title: [...]
- Topics Covered: [...]

[Continue for all weeks]

**Course Access URL:** [e.g., "https://vizuara.ai/courses/course_20005432" or "N/A"]

**Additional Notes for Phase I:** [Any special instructions students should know about videos, code files, assignments, etc.]

---

## PHASE II RESEARCH TOPICS

**Phase II Description:** [e.g., "Students select a research topic, get a custom roadmap, conduct experiments, and write a workshop-quality paper"]

**Research Duration:** [e.g., "10 weeks" or "3 months"]

**Number of Milestones:** [e.g., "5" - typically 5 milestones of 2 weeks each]

### Research Topic Categories:

Provide 6-12 categories with 3-5 subtopics each. Format as shown:

**Category 1: [e.g., "Multilingual NLP & Translation"]**

1.1 [Subtopic]: [Brief description]
   - Example: "Low-Resource Machine Translation: Build translation systems for languages with limited training data using transfer learning and data augmentation"

1.2 [Subtopic]: [Brief description]

1.3 [Subtopic]: [Brief description]

**Category 2: [e.g., "Question Answering & Information Retrieval"]**

2.1 [Subtopic]: [Brief description]

[Continue for all categories]

---

## TARGET CONFERENCES

List 4-8 conferences where students might submit papers:

1. [e.g., "ACL (Association for Computational Linguistics)"]
2. [e.g., "EMNLP (Empirical Methods in NLP)"]
3. [e.g., "NAACL (North American Chapter of ACL)"]
4. [...]

---

## WELCOME EMAIL CONTENT

**When students are onboarded via admin, they receive an email. Fill in the template below:**

```
Hello [STUDENT_PREFERRED_NAME]!

Let us get started with the [BOOTCAMP_NAME].

Login here: [RAILWAY_URL]/student

Email: [STUDENT_EMAIL]
Password: [AUTO_GENERATED_PASSWORD]

When you log in to this website, you will already see an onboarding email with the next steps of action. All our communication will happen on this website.

Let us get started.

Best regards,
[MENTOR_NAME]
```

**If you want to customize this email, write your custom version here:**
[Leave blank to use default, or write custom email text]

---

## ONBOARDING MESSAGE (IN-APP)

**This is the FIRST message students see when they log in. Fill in the template:**

```
Hi,

Welcome to the [BOOTCAMP_NAME].

Please note the following points

1) We will allocate ~[PHASE_I_DURATION] for you to go through the foundational material. The material you have to follow is custom-allocated based on your topic of interest- that way, your foundation-building exercise is very focused.

2) Whenever you face any doubts or queries, ask on this platform.

3) After going through the foundations, the remaining ~[PHASE_II_DURATION] after phase one will be spent on research.

This is a [TOTAL_DURATION] program starting today ([START_DATE] - [END_DATE]).

Let's get started :)
```

**If you want to customize this message, write your custom version here:**
[Leave blank to use default, or write custom message text]

---

## RESOURCES TO PROVIDE

### Phase I Voice Notes

**Do you have voice notes for Phase I?** [Yes/No]

**If Yes:**
- Upload voice notes to: `resources/phase1-voice-notes/`
- List filenames: [e.g., "phase1-motivation.mp3, phase1-push.mp3"]

**If No:** We'll reuse existing placeholder voice notes

### Phase II Voice Notes

**Do you have voice notes for Phase II?** [Yes/No]

**If Yes:**
- Upload voice notes to: `resources/phase2-voice-notes/`
- List filenames: [e.g., "phase2-motivation.mp3, phase2-milestone-reminder.mp3"]

**If No:** We'll reuse existing placeholder voice notes

### Sample Roadmaps

**Do you have sample roadmap PDFs?** [Yes/No]

**If Yes:**
- Upload PDFs to: `resources/phase2-roadmaps/`
- List filenames: [e.g., "Student1_NLP_Roadmap.pdf, Student2_NLP_Roadmap.pdf"]

**If No:** We'll reuse existing template format

### Sample Papers

**Do you have sample papers from this domain?** [Yes/No]

**If Yes:**
- Upload PDFs to: `resources/sample-papers/`
- List filenames and descriptions:
  ```
  paper1.pdf: "Workshop paper on neural machine translation"
  paper2.pdf: "ArXiv preprint on multilingual embeddings"
  ```

**If No:** We'll reuse existing samples (students won't see them unless they ask)

---

## DEPLOYMENT INFORMATION

### Railway URL

**Production URL:** [e.g., "https://vizuara-nlp-assistant-production.up.railway.app"]

### Environment Variables

**These should already exist in Railway. Confirm or update:**

- `GEMINI_API_KEY`: [Generate new one? Yes/No - if yes, I'll remind you]
- `BREVO_FROM_EMAIL`: [Should match mentor email above]
- `BREVO_FROM_NAME`: [Should match mentor name above]
- `DATABASE_URL`: [Keep existing? Yes/No]
- `NEXT_PUBLIC_SUPABASE_URL`: [Keep existing? Yes/No]

---

## DATABASE CLEANUP

**CRITICAL:** Do you want to clean old bootcamp data from the database?

**Options:**

1. **Full Clean (Recommended for new bootcamp):**
   - Delete ALL existing students and messages
   - Start fresh with new bootcamp
   - I'll provide SQL commands to run in Supabase

2. **Selective Clean:**
   - Keep existing students
   - Delete only old system messages
   - I'll provide selective SQL commands

3. **No Clean (Not Recommended):**
   - Keep all existing data
   - Old messages may confuse students

**Your choice:** [1, 2, or 3]

---

## SPECIAL CUSTOMIZATIONS

**Are there any bootcamp-specific features or customizations needed?**

Examples:
- Different milestone structure (not 5 milestones)
- Custom tools the agent should have access to
- Special file types students will upload
- Domain-specific evaluation metrics
- Anything else unique to this bootcamp

[Write any special requirements here, or write "None"]

---

## CONFIRMATION CHECKLIST

Before submitting this prompt, confirm:

- [ ] I have filled out ALL sections above
- [ ] Curriculum breakdown is COMPLETE for all weeks
- [ ] Research topics have 6-12 categories with subtopics
- [ ] I have uploaded any new resource files to the `resources/` folder
- [ ] I understand Claude will make all code changes automatically
- [ ] I will run database cleanup SQL commands if needed
- [ ] I will verify the deployment after Claude finishes

---

# HOW TO USE THIS TEMPLATE

1. **Copy this entire file**
2. **Fill in EVERY section** (don't leave blanks - if something doesn't apply, write "N/A")
3. **Upload any resource files** (voice notes, PDFs) to the `resources/` folder first
4. **Paste the completed template** to Claude Code with this instruction:

```
I want to convert this codebase from the current bootcamp to a new bootcamp.
Here are the complete details. Please update ALL files, including:
- System prompts and agent persona
- UI components (admin, student, mentor pages)
- Email templates
- Curriculum content (Phase I and Phase II)
- Database seed data
- Configuration files
- Test files
- Resources metadata

After you finish, provide me with:
1. Summary of all changes made
2. SQL commands to clean the database (if I selected option 1 or 2)
3. Deployment verification checklist
4. List of files I need to commit and push

[PASTE FILLED TEMPLATE HERE]
```

---

# EXAMPLE: Filled Template (NLP Bootcamp)

```markdown
## BOOTCAMP DETAILS

**Bootcamp Name:** Natural Language Processing Research Bootcamp

**Short Name/Abbreviation:** NLP

**Total Duration:** 4 months

**Phase I Duration:** 7 weeks

**Phase II Duration:** 10 weeks

---

## MENTOR PERSONA

**Full Name:** Dr. Sarah Chen

**Email:** sarahchen@vizuara.com

**Title/Credentials:** PhD Stanford

**Expertise:** Expert in NLP, Transformers, Large Language Models, Multilingual AI

**Background:** Published 15+ papers at ACL, EMNLP, and NAACL. Previously led NLP research at Google Brain. Specializes in multilingual models, low-resource languages, and interpretability in language models.

---

## PHASE I CURRICULUM

**Phase I Description:** Students watch pre-recorded video lectures covering NLP fundamentals, transformers, fine-tuning, and deployment

**Total Weeks:** 7

**Total Lectures:** 10

### Week-by-Week Breakdown:

**Week 1: Foundations**

- Lecture Title: Introduction to NLP & Text Processing
- Topics Covered: Tokenization, Stemming, Lemmatization, Text Cleaning, Bag of Words, TF-IDF

- Lecture Title: Word Embeddings Fundamentals
- Topics Covered: Word2Vec (Skip-gram, CBOW), GloVe, FastText, Embedding Visualization

**Week 2: Neural NLP**

- Lecture Title: RNNs and LSTMs for Text
- Topics Covered: Sequence modeling, Vanishing gradients, LSTM architecture, Bidirectional RNNs

- Lecture Title: Attention Mechanisms
- Topics Covered: Attention basics, Self-attention, Multi-head attention, Attention visualization

**Week 3: Transformers**

- Lecture Title: The Transformer Architecture
- Topics Covered: Positional encoding, Multi-head attention, Feed-forward layers, Layer normalization

**Week 4: Pre-trained Models**

- Lecture Title: BERT and Transfer Learning
- Topics Covered: Masked language modeling, Next sentence prediction, Fine-tuning BERT, Tokenization

**Week 5: Advanced Transformers**

- Lecture Title: GPT and Generative Models
- Topics Covered: Autoregressive generation, GPT architecture, Prompt engineering, Few-shot learning

- Lecture Title: T5 and Encoder-Decoder Models
- Topics Covered: Text-to-text framework, T5 architecture, Multi-task learning

**Week 6: Fine-tuning & Applications**

- Lecture Title: Fine-tuning Large Language Models
- Topics Covered: Task-specific fine-tuning, LoRA, Adapter layers, Efficient fine-tuning

**Week 7: Deployment & Production**

- Lecture Title: Deploying NLP Models
- Topics Covered: Model optimization, ONNX, Quantization, API deployment, Scaling strategies

- Lecture Title: Building an NLP Application
- Topics Covered: End-to-end pipeline, Data preprocessing, Model serving, Monitoring

**Course Access URL:** https://vizuara.ai/courses/course_20005432

**Additional Notes for Phase I:** Students will receive Colab notebooks for hands-on practice with each lecture. Code examples use HuggingFace Transformers library.

---

## PHASE II RESEARCH TOPICS

[... continue with full NLP research topics ...]

---

[And so on for all sections]
```

---

**That's it!** Once you fill this out completely and give it to Claude, it will handle the entire conversion automatically.
