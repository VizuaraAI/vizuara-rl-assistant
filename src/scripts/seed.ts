/**
 * Database seed script
 * Creates test data for development
 * Run with: npm run db:seed
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import * as schema from '../db/schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function clearDatabase() {
  console.log('Clearing existing data...');
  // Delete in reverse order of dependencies
  await db.delete(schema.roadmaps);
  await db.delete(schema.progress);
  await db.delete(schema.memory);
  await db.delete(schema.messages);
  await db.delete(schema.conversations);
  await db.delete(schema.students);
  await db.delete(schema.users);
  console.log('Database cleared.');
}

async function seed() {
  console.log('Starting seed...\n');

  await clearDatabase();

  const passwordHash = await hashPassword('password123');

  // ============== CREATE MENTOR ==============
  console.log('Creating mentor...');
  const [mentor] = await db
    .insert(schema.users)
    .values({
      name: 'Dr. Sreedath Panat',
      email: 'sreedath@vizuara.com',
      passwordHash,
      role: 'mentor',
    })
    .returning();
  console.log(`  Created mentor: ${mentor.name} (${mentor.email})`);

  // ============== CREATE STUDENTS ==============
  console.log('\nCreating students...');

  // Student 1: Priya - Phase I, Topic 3
  const [priyaUser] = await db
    .insert(schema.users)
    .values({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      passwordHash,
      role: 'student',
    })
    .returning();

  const [priya] = await db
    .insert(schema.students)
    .values({
      userId: priyaUser.id,
      mentorId: mentor.id,
      currentPhase: 'phase1',
      currentTopicIndex: 3,
      enrollmentDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
      phase1Start: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    })
    .returning();
  console.log(`  Created student: ${priyaUser.name} (Phase I, Topic 3)`);

  // Student 2: Alex - Phase I, Topic 5
  const [alexUser] = await db
    .insert(schema.users)
    .values({
      name: 'Alex Chen',
      email: 'alex@example.com',
      passwordHash,
      role: 'student',
    })
    .returning();

  const [alex] = await db
    .insert(schema.students)
    .values({
      userId: alexUser.id,
      mentorId: mentor.id,
      currentPhase: 'phase1',
      currentTopicIndex: 5,
      enrollmentDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 5 weeks ago
      phase1Start: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    })
    .returning();
  console.log(`  Created student: ${alexUser.name} (Phase I, Topic 5)`);

  // Student 3: Sarah - Phase II, Milestone 2
  const [sarahUser] = await db
    .insert(schema.users)
    .values({
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      passwordHash,
      role: 'student',
    })
    .returning();

  const [sarah] = await db
    .insert(schema.students)
    .values({
      userId: sarahUser.id,
      mentorId: mentor.id,
      currentPhase: 'phase2',
      currentTopicIndex: 8, // Completed Phase I
      currentMilestone: 2,
      researchTopic: 'Deep Learning for Multi-Organ CT Segmentation',
      enrollmentDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000), // 10 weeks ago
      phase1Start: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
      phase2Start: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 4 weeks ago
    })
    .returning();
  console.log(`  Created student: ${sarahUser.name} (Phase II, Milestone 2)`);

  // ============== CREATE CONVERSATIONS ==============
  console.log('\nCreating conversations...');

  const [priyaConv] = await db
    .insert(schema.conversations)
    .values({ studentId: priya.id })
    .returning();

  const [alexConv] = await db
    .insert(schema.conversations)
    .values({ studentId: alex.id })
    .returning();

  const [sarahConv] = await db
    .insert(schema.conversations)
    .values({ studentId: sarah.id })
    .returning();

  console.log('  Created conversations for all students');

  // ============== CREATE MESSAGES ==============
  console.log('\nCreating sample messages...');

  // Priya's conversation (5 messages)
  await db.insert(schema.messages).values([
    {
      conversationId: priyaConv.id,
      role: 'student',
      content: "Hi Dr. Sreedath! I just started the RCNN section. The concept of region proposals is a bit confusing to me. Can you explain it simply?",
      status: 'sent',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      conversationId: priyaConv.id,
      role: 'agent',
      content: "Hey Priya! Great question. Think of region proposals as a two-stage process - first you find candidate regions that might contain objects, then you classify each region.\n\nThe video in Lesson 3.2 has a great visual diagram of how Selective Search generates proposals. Have you gotten to that part yet? I'd recommend watching it with the code example open side-by-side.",
      status: 'sent',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
    },
    {
      conversationId: priyaConv.id,
      role: 'student',
      content: "That makes sense! The two-stage process is clearer now. I'll check out Lesson 3.2. Also, I'm interested in healthcare applications - do you think object detection would work well for medical imaging?",
      status: 'sent',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      conversationId: priyaConv.id,
      role: 'agent',
      content: "Absolutely, Priya! Healthcare is one of the most exciting areas for computer vision. Medical imaging is a perfect use case - you could build a system that:\n\n1. Detects tumors or anomalies in X-rays/CT scans\n2. Segments organs or lesions using Mask RCNN or UNet\n3. Tracks disease progression over time\n4. Flags critical findings for radiologist review\n\nWhen you get to Phase II, this could make an excellent research project. In fact, it's one of our predefined topics under Medical Imaging AI.\n\nFor now, focus on understanding the fundamentals. We'll dive deeper when you're ready for Phase II. How's your progress on the current videos?",
      status: 'sent',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
    },
    {
      conversationId: priyaConv.id,
      role: 'student',
      content: "That sounds amazing! I'm about halfway through Topic 3 now. Should finish in a couple days.",
      status: 'sent',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  ]);
  console.log("  Created 5 messages for Priya's conversation");

  // Alex's conversation (8 messages)
  await db.insert(schema.messages).values([
    {
      conversationId: alexConv.id,
      role: 'student',
      content: "Dr. Sreedath, I'm working through the YOLO section and I'm confused about anchor boxes. When should I use predefined anchors vs anchor-free approaches?",
      status: 'sent',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      conversationId: alexConv.id,
      role: 'agent',
      content: "Great question, Alex! This is one of the trickier decisions in object detection.\n\n**Predefined anchors** work well when:\n- You have a good understanding of your object size distributions\n- Your objects have consistent aspect ratios\n- You're just starting out and need a baseline (like YOLOv3/v5)\n\n**Anchor-free approaches** (like YOLOX, FCOS) are better when:\n- Objects vary significantly in size and aspect ratio\n- You want simpler, faster training\n- You're dealing with dense, small objects\n\nFor autonomous driving (which I know you're interested in), anchor-free often works better since vehicles, pedestrians, and cyclists have very different aspect ratios.\n\nThe key insight: there's no universally \"best\" approach. I'd recommend starting with YOLOv8 (anchor-free by default), then comparing with YOLOv5 (anchor-based) on your specific use case.\n\nLesson 7.3 covers this in detail with code examples. Have you run those notebooks yet?",
      status: 'sent',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
    },
    {
      conversationId: alexConv.id,
      role: 'student',
      content: "Thanks! Yes I ran the notebooks. Quick follow-up - how do I evaluate which detection approach is actually better for my use case?",
      status: 'sent',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      conversationId: alexConv.id,
      role: 'agent',
      content: "Excellent follow-up, Alex. This is exactly the right question to ask.\n\nFor object detection evaluation, you'll want to measure:\n\n1. **Detection metrics:**\n   - mAP (mean Average Precision): Standard metric at IoU 0.5 and 0.5:0.95\n   - AP per class: How well does each object category perform?\n\n2. **Speed metrics:**\n   - FPS (Frames Per Second): Critical for real-time applications\n   - Inference latency: Important for edge deployment\n\nLesson 7.4 covers the COCO evaluation framework which is perfect for this. You run inference on a validation set and compute mAP across different IoU thresholds.\n\nFor your autonomous driving use case, pay special attention to AP for small objects (pedestrians at distance) and mAP@0.75 for precise localization.\n\nWant me to elaborate on any of these metrics?",
      status: 'sent',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
    },
    {
      conversationId: alexConv.id,
      role: 'student',
      content: "This is super helpful! COCO metrics look perfect. One more thing - my Python background is pretty strong but I'm less familiar with the object detection research side. Any papers you'd recommend?",
      status: 'sent',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      conversationId: alexConv.id,
      role: 'agent',
      content: "Happy to help, Alex! Here are a few papers that'll level you up on object detection:\n\n1. **\"YOLOX: Exceeding YOLO Series in 2021\"** - Great paper on anchor-free detection with practical insights\n\n2. **\"Focal Loss for Dense Object Detection\" (RetinaNet)** - Critical paper on handling class imbalance in detection\n\n3. **\"Objects as Points\" (CenterNet)** - Elegant anchor-free approach that's very relevant for autonomous driving\n\nAll of these are on arXiv. For your autonomous driving project in Phase II, you'll want to be familiar with these concepts.\n\nHow's your progress on the remaining YOLO videos? You're getting close to finishing Phase I!",
      status: 'sent',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
    },
    {
      conversationId: alexConv.id,
      role: 'student',
      content: "Just finished Lesson 7.2 today. Should wrap up YOLO by end of week, then just Roboflow left!",
      status: 'sent',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      conversationId: alexConv.id,
      role: 'agent',
      content: "Excellent progress, Alex! You're flying through the material. At this pace, you'll be ready for Phase II in about 2 weeks.\n\nStart thinking about your research topic. Given your interest in autonomous vehicles and strong Python skills, a few options come to mind:\n\n1. **Multi-Object Tracking for Autonomous Driving** - Building a real-time detection + tracking system\n2. **3D Object Detection from LiDAR + Camera Fusion** - Combining sensor modalities for robust perception\n\nWe can discuss more when you finish the videos. Keep up the great work!",
      status: 'sent',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000),
    },
  ]);
  console.log("  Created 8 messages for Alex's conversation");

  // Sarah's conversation (10 messages) - Phase II focused
  await db.insert(schema.messages).values([
    {
      conversationId: sarahConv.id,
      role: 'student',
      content: "Hi Dr. Sreedath! I'm starting Milestone 2 of my research project on medical image segmentation. I have my literature review done and dataset identified. What should I focus on for implementation?",
      status: 'sent',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      conversationId: sarahConv.id,
      role: 'agent',
      content: "Great to hear from you, Sarah! Congrats on completing Milestone 1.\n\nFor Milestone 2 (Implementation Setup), based on your roadmap, here's what to focus on:\n\n1. **Dataset Processing Pipeline:**\n   - Load your medical imaging dataset (CT scans or MRI)\n   - Implement preprocessing (normalization, augmentation)\n   - Create train/val/test splits with proper stratification\n\n2. **Baseline System:**\n   - Set up your UNet architecture as baseline\n   - Implement the training loop with appropriate loss function\n   - Get end-to-end training and inference working\n\n3. **Evaluation Framework:**\n   - Implement Dice coefficient and IoU metrics\n   - Set up visualization for segmentation overlays\n\nBy end of Milestone 2, you should have a working baseline that produces segmentation masks, even if they're not perfect yet. Milestone 3 is where you'll iterate and improve.\n\nWhat's your current status on each of these?",
      status: 'sent',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    },
    {
      conversationId: sarahConv.id,
      role: 'student',
      content: "I have the medical imaging data loaded and preprocessing is mostly done. Struggling with the data augmentation strategy - medical images need special handling compared to natural images.",
      status: 'sent',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      conversationId: sarahConv.id,
      role: 'agent',
      content: "Ah yes, medical image augmentation is tricky! Standard augmentations can introduce unrealistic artifacts.\n\nBased on my experience with medical imaging, I'd recommend:\n\n**Domain-appropriate augmentations:**\nFor medical images, focus on:\n- Rotation (small angles, 10-15 degrees)\n- Elastic deformation (mimics natural tissue variation)\n- Intensity scaling and shifting\n- Avoid: heavy color jitter, cutout, mixup\n\n**Implementation approach:**\n```python\nimport albumentations as A\n\nmedical_transform = A.Compose([\n    A.Rotate(limit=15),\n    A.ElasticTransform(alpha=50, sigma=5),\n    A.RandomBrightnessContrast(0.1, 0.1),\n])\n```\n\nThere's also a paper \"nnU-Net\" that discusses optimal augmentation for medical imaging - worth a quick skim.\n\nWant me to help debug your augmentation pipeline? Feel free to share it.",
      status: 'sent',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
    },
    {
      conversationId: sarahConv.id,
      role: 'student',
      content: "That augmentation approach makes so much sense! Let me implement that. Also, for the model architecture - should I use vanilla UNet or try a more advanced variant like Attention UNet?",
      status: 'sent',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      conversationId: sarahConv.id,
      role: 'agent',
      content: "Good question, Sarah. Here's my recommendation:\n\n**For your baseline (Milestone 2):** Use vanilla UNet. It's:\n- Easier to set up and debug\n- Well-documented with many reference implementations\n- Strong baseline for medical image segmentation\n\n**For experiments (Milestone 3):** Consider comparing:\n- Vanilla UNet (your baseline)\n- Attention UNet (adds attention gates)\n- TransUNet (transformer encoder + UNet decoder)\n\nThe comparison between CNN-only vs. attention/transformer models could be an interesting ablation for your paper! Most recent papers assume transformers are better, but for smaller datasets vanilla UNet often wins.\n\nFor now, get vanilla UNet working end-to-end. You can always add architecture comparisons in Milestone 3.\n\nHow's your radiology background helping with the project? I remember you mentioned experience reading medical images.",
      status: 'sent',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
    },
    {
      conversationId: sarahConv.id,
      role: 'student',
      content: "Yes! I worked as a radiology technician for 2 years before grad school, so I know exactly what accurate organ segmentation should look like. That's actually why I chose this project.",
      status: 'sent',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      conversationId: sarahConv.id,
      role: 'agent',
      content: "That's a huge advantage, Sarah! Your radiology tech experience is invaluable for:\n\n1. **Evaluation:** You can assess segmentation quality in ways Dice score alone misses\n2. **Error analysis:** You'll recognize clinically significant boundary errors\n3. **Writing:** Your paper's related work and methodology will be more credible\n\nI'd suggest creating a small \"expert evaluation set\" - maybe 50 images where YOU manually refine the ground truth masks. This becomes gold standard for evaluation and makes your paper stronger.\n\nThis domain expertise is exactly what makes for impactful research. Keep leveraging it!\n\nLet me know when you have the baseline working - we'll review together before you move to Milestone 3.",
      status: 'sent',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
    },
    {
      conversationId: sarahConv.id,
      role: 'student',
      content: "Love the expert evaluation set idea! I'll do that. Quick question - the PDF-to-Colab tool you mentioned, would that help me reproduce some of the baseline UNet papers' experiments?",
      status: 'sent',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      conversationId: sarahConv.id,
      role: 'agent',
      content: "Yes! The PDF-to-Colab tool (https://paper-to-notebook-production.up.railway.app/) is perfect for that.\n\nUpload any ML paper PDF and it generates a Colab notebook with:\n- Paper summary and key contributions\n- Pseudocode from the methodology section\n- Starter implementation code\n- Dataset loading snippets\n\nSuper useful for quickly understanding and reproducing baselines. Try it with the \"Medical Image Segmentation\" papers from your lit review.\n\nOne tip: The generated code is a starting point, not production-ready. You'll need to adapt it for your specific dataset format.\n\nHow's the augmentation pipeline coming along?",
      status: 'sent',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
    },
  ]);
  console.log("  Created 10 messages for Sarah's conversation");

  // ============== CREATE MEMORY ==============
  console.log('\nCreating memory entries...');

  // Priya's memory
  await db.insert(schema.memory).values([
    {
      studentId: priya.id,
      memoryType: 'long_term',
      key: 'profile.learning_style',
      value: 'code-examples',
    },
    {
      studentId: priya.id,
      memoryType: 'long_term',
      key: 'profile.interests',
      value: ['healthcare AI', 'clinical documentation', 'NLP'],
    },
    {
      studentId: priya.id,
      memoryType: 'long_term',
      key: 'history.topics_discussed',
      value: ['chains', 'LangChain', 'agents', 'healthcare applications'],
    },
  ]);
  console.log("  Created memory for Priya");

  // Alex's memory
  await db.insert(schema.memory).values([
    {
      studentId: alex.id,
      memoryType: 'long_term',
      key: 'profile.learning_style',
      value: 'conceptual-first',
    },
    {
      studentId: alex.id,
      memoryType: 'long_term',
      key: 'profile.interests',
      value: ['legal AI', 'contract analysis', 'RAG systems'],
    },
    {
      studentId: alex.id,
      memoryType: 'long_term',
      key: 'profile.strengths',
      value: ['Python', 'strong programming background'],
    },
    {
      studentId: alex.id,
      memoryType: 'long_term',
      key: 'history.topics_discussed',
      value: ['chunking strategies', 'RAG evaluation', 'RAGAS', 'legal applications'],
    },
    {
      studentId: alex.id,
      memoryType: 'long_term',
      key: 'history.papers_recommended',
      value: ['RAGAS paper', 'Lost in the Middle', 'RAG Benchmarking'],
    },
  ]);
  console.log("  Created memory for Alex");

  // Sarah's memory
  await db.insert(schema.memory).values([
    {
      studentId: sarah.id,
      memoryType: 'long_term',
      key: 'profile.background',
      value: 'Medical scribe for 2 years, grad school',
    },
    {
      studentId: sarah.id,
      memoryType: 'long_term',
      key: 'profile.interests',
      value: ['clinical NLP', 'EHR systems', 'medical AI'],
    },
    {
      studentId: sarah.id,
      memoryType: 'long_term',
      key: 'profile.strengths',
      value: ['domain expertise in clinical documentation', 'EHR experience'],
    },
    {
      studentId: sarah.id,
      memoryType: 'long_term',
      key: 'research.dataset',
      value: 'MIMIC-III clinical notes subset',
    },
    {
      studentId: sarah.id,
      memoryType: 'long_term',
      key: 'research.current_blockers',
      value: ['chunking strategy for clinical notes'],
    },
    {
      studentId: sarah.id,
      memoryType: 'long_term',
      key: 'history.topics_discussed',
      value: ['clinical chunking', 'section-aware chunking', 'model selection', 'expert evaluation'],
    },
  ]);
  console.log("  Created memory for Sarah");

  // ============== CREATE PROGRESS ==============
  console.log('\nCreating progress entries...');

  // Priya's progress (Phase I, completed topics 1-2, in progress on 3)
  await db.insert(schema.progress).values([
    { studentId: priya.id, phase: 'phase1', topicIndex: 1, status: 'completed' },
    { studentId: priya.id, phase: 'phase1', topicIndex: 2, status: 'completed' },
    { studentId: priya.id, phase: 'phase1', topicIndex: 3, status: 'in_progress' },
  ]);

  // Alex's progress (Phase I, completed topics 1-4, in progress on 5)
  await db.insert(schema.progress).values([
    { studentId: alex.id, phase: 'phase1', topicIndex: 1, status: 'completed' },
    { studentId: alex.id, phase: 'phase1', topicIndex: 2, status: 'completed' },
    { studentId: alex.id, phase: 'phase1', topicIndex: 3, status: 'completed' },
    { studentId: alex.id, phase: 'phase1', topicIndex: 4, status: 'completed' },
    { studentId: alex.id, phase: 'phase1', topicIndex: 5, status: 'in_progress' },
  ]);

  // Sarah's progress (Phase I complete, Phase II milestone 1 complete, milestone 2 in progress)
  await db.insert(schema.progress).values([
    { studentId: sarah.id, phase: 'phase1', topicIndex: 1, status: 'completed' },
    { studentId: sarah.id, phase: 'phase1', topicIndex: 2, status: 'completed' },
    { studentId: sarah.id, phase: 'phase1', topicIndex: 3, status: 'completed' },
    { studentId: sarah.id, phase: 'phase1', topicIndex: 4, status: 'completed' },
    { studentId: sarah.id, phase: 'phase1', topicIndex: 5, status: 'completed' },
    { studentId: sarah.id, phase: 'phase1', topicIndex: 6, status: 'completed' },
    { studentId: sarah.id, phase: 'phase2', milestone: 1, status: 'completed', notes: 'Literature review complete. 18 papers catalogued. Research questions defined.' },
    { studentId: sarah.id, phase: 'phase2', milestone: 2, status: 'in_progress', notes: 'Working on implementation setup. Chunking strategy being refined.' },
  ]);
  console.log("  Created progress for all students");

  // ============== CREATE ROADMAP FOR SARAH ==============
  console.log('\nCreating roadmap for Sarah...');

  await db.insert(schema.roadmaps).values({
    studentId: sarah.id,
    topic: 'Deep Learning for Multi-Organ CT Segmentation',
    content: {
      title: '8-Week Research Roadmap',
      subtitle: 'Deep Learning for Multi-Organ CT Segmentation',
      preparedFor: 'Sarah Johnson',
      date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      abstract: 'This roadmap outlines an 8-week research project to develop a UNet-based system for automatically segmenting multiple organs from CT scans. Using a public medical imaging dataset, we will build a segmentation pipeline with domain-specific augmentation strategies, implement automated and expert evaluation metrics, and produce a workshop-quality manuscript.',
      milestones: [
        {
          number: 1,
          weeks: '1-2',
          title: 'Literature Review & Foundations',
          status: 'completed',
          objectives: [
            'Survey medical image segmentation and UNet variants literature',
            'Identify key evaluation metrics for organ segmentation',
            'Define research questions and scope',
          ],
          deliverables: [
            'Literature review memo (3-5 pages)',
            'Excel tracker with 15+ papers',
            'Research questions document',
          ],
        },
        {
          number: 2,
          weeks: '3-4',
          title: 'Dataset & Implementation Setup',
          status: 'in_progress',
          objectives: [
            'Set up medical imaging data access and preprocessing',
            'Implement domain-appropriate augmentation pipeline',
            'Build baseline UNet segmentation model',
          ],
          deliverables: [
            'Preprocessed dataset with train/val/test splits',
            'Working baseline system producing segmentation masks',
            'Evaluation framework with Dice and IoU metrics',
          ],
        },
        {
          number: 3,
          weeks: '5-6',
          title: 'Core Experiments',
          status: 'not_started',
          objectives: [
            'Run ablation studies on augmentation strategies',
            'Compare UNet variants (vanilla, Attention, TransUNet)',
            'Conduct expert evaluation on subset',
          ],
          deliverables: [
            'Results CSV with all experiment runs',
            'Analysis notebooks with visualizations',
            'Expert evaluation annotations',
          ],
        },
        {
          number: 4,
          weeks: '7-8',
          title: 'Analysis & Writing',
          status: 'not_started',
          objectives: [
            'Complete quantitative and qualitative analysis',
            'Write manuscript draft',
            'Identify target venues',
          ],
          deliverables: [
            'Complete manuscript draft',
            'Figures and tables for paper',
            'List of target conferences/workshops',
          ],
        },
      ],
    },
  });
  console.log("  Created roadmap for Sarah");

  console.log('\n✅ Seed completed successfully!');
  console.log('\nTest credentials:');
  console.log('  Mentor: sreedath@vizuara.com / password123');
  console.log('  Student: priya@example.com / password123');
  console.log('  Student: alex@example.com / password123');
  console.log('  Student: sarah@example.com / password123');

  // Close connection
  await client.end();
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
