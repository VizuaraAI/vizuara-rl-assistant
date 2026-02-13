/**
 * Chat API Endpoint - Powered by Gemini 2.5 Pro
 * POST /api/agent/chat - Process message through agent with full tool execution
 * Supports native multimodal inputs: text, PDFs, images (no parsing needed!)
 */

import { NextRequest, NextResponse } from 'next/server';

// Extend timeout for long-running Gemini requests with large PDFs
export const maxDuration = 120; // 2 minutes (Railway supports up to 5 minutes)
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, Part, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { buildSystemPrompt } from '@/services/agent/prompts/system';
import { getPhase1Tools, getPhase2Tools, createPhase1ToolRegistry, createPhase2ToolRegistry } from '@/services/agent/tools';
import type { Tool } from '@/services/agent/tools/types';
import { getStudentProfile, formatProfileForContext, updateMemoryFromConversation, getRecentDailyNotes } from '@/services/memory';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Convert our tool format to Gemini function declarations
function convertToolsToGemini(tools: Tool[]): FunctionDeclaration[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: convertSchemaToGemini(tool.input_schema),
  }));
}

// Convert JSON Schema to Gemini Schema format
function convertSchemaToGemini(schema: any): any {
  if (!schema) return undefined;

  const geminiSchema: any = {};

  if (schema.type === 'object') {
    geminiSchema.type = SchemaType.OBJECT;
    if (schema.properties) {
      geminiSchema.properties = {};
      for (const [key, value] of Object.entries(schema.properties)) {
        geminiSchema.properties[key] = convertSchemaToGemini(value);
      }
    }
    if (schema.required) {
      geminiSchema.required = schema.required;
    }
  } else if (schema.type === 'string') {
    geminiSchema.type = SchemaType.STRING;
    if (schema.description) geminiSchema.description = schema.description;
    if (schema.enum) geminiSchema.enum = schema.enum;
  } else if (schema.type === 'number' || schema.type === 'integer') {
    geminiSchema.type = SchemaType.NUMBER;
    if (schema.description) geminiSchema.description = schema.description;
  } else if (schema.type === 'boolean') {
    geminiSchema.type = SchemaType.BOOLEAN;
    if (schema.description) geminiSchema.description = schema.description;
  } else if (schema.type === 'array') {
    geminiSchema.type = SchemaType.ARRAY;
    if (schema.items) {
      geminiSchema.items = convertSchemaToGemini(schema.items);
    }
  }

  return geminiSchema;
}

// Check if message is a conversation-ending statement that doesn't need a response
function isConversationEnding(message: string): boolean {
  const normalized = message.trim().toLowerCase();

  // If it contains a question mark, it's NOT an ending - they're asking something
  if (normalized.includes('?')) {
    return false;
  }

  // Short acknowledgment patterns (must be short messages)
  const shortPatterns = [
    /^(sure|ok|okay|got it|will do|sounds good|perfect|great|thanks|thank you|bye|see you|talk later)[\s,!.]*$/i,
    /^(sure|ok|okay|got it|will do|sounds good|perfect|great|thanks|thank you)[\s,!.]*dr\.?\s*raj[\s,!.]*$/i,
    /^thanks[\s,!.]*$/i,
    /^thank you[\s,!.]*$/i,
  ];

  // Excitement/anticipation patterns (can be longer messages)
  const excitementPatterns = [
    /^(sounds good|sure|ok|okay|perfect|great).*?(i('m| am) (really )?(excited|looking forward)|excited to|looking forward)/i,
    /^(i('m| am) (really )?(excited|looking forward)|excited to|looking forward)/i,
    /(excited|looking forward).*?(get started|begin|start|learn|dive in)/i,
    /can't wait to (get started|begin|start|learn)/i,
  ];

  const wordCount = normalized.split(/\s+/).length;

  // Check short patterns only for short messages (8 words or less)
  if (wordCount <= 8) {
    for (const pattern of shortPatterns) {
      if (pattern.test(normalized)) {
        return true;
      }
    }
  }

  // Check excitement patterns for messages up to 15 words
  if (wordCount <= 15) {
    for (const pattern of excitementPatterns) {
      if (pattern.test(normalized)) {
        return true;
      }
    }
  }

  return false;
}

// Attachment type for multimodal support
interface Attachment {
  storagePath: string;
  mimeType: string;
  filename: string;
  publicUrl?: string;
}

// MIME types supported by Gemini for inline data
const GEMINI_SUPPORTED_MIME_TYPES = new Set([
  // Images
  'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif', 'image/gif',
  // PDFs
  'application/pdf',
  // Audio
  'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/aiff', 'audio/aac', 'audio/ogg', 'audio/flac',
  // Video
  'video/mp4', 'video/mpeg', 'video/mov', 'video/avi', 'video/x-flv', 'video/mpg', 'video/webm', 'video/wmv', 'video/3gpp',
  // Text
  'text/plain', 'text/html', 'text/css', 'text/javascript', 'text/markdown',
]);

// Download file from Supabase and convert to Gemini Part
async function attachmentToGeminiPart(attachment: Attachment): Promise<{ part: Part | null; skipped: boolean; reason?: string }> {
  try {
    console.log(`[Gemini] Processing attachment: ${attachment.filename}, mime: ${attachment.mimeType}`);

    // Check if MIME type is supported
    if (!GEMINI_SUPPORTED_MIME_TYPES.has(attachment.mimeType)) {
      console.log(`[Gemini] Skipping unsupported MIME type: ${attachment.mimeType}`);
      return {
        part: null,
        skipped: true,
        reason: `File type not supported for AI analysis: ${attachment.mimeType}. Supported: PDF, images, text files.`
      };
    }

    console.log(`[Gemini] Downloading attachment: ${attachment.filename} from ${attachment.storagePath}`);

    const { data, error } = await supabase.storage
      .from('documents')
      .download(attachment.storagePath);

    if (error || !data) {
      console.error(`[Gemini] Failed to download ${attachment.filename}:`, error);
      return { part: null, skipped: false };
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    const base64 = buffer.toString('base64');

    console.log(`[Gemini] Downloaded ${attachment.filename}: ${buffer.length} bytes, mime: ${attachment.mimeType}`);

    // Gemini supports inline data for images, PDFs, etc.
    return {
      part: {
        inlineData: {
          mimeType: attachment.mimeType,
          data: base64,
        },
      },
      skipped: false,
    };
  } catch (error) {
    console.error(`[Gemini] Error processing attachment ${attachment.filename}:`, error);
    return { part: null, skipped: false };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, message, attachments } = body as {
      studentId: string;
      message: string;
      attachments?: Attachment[];
    };

    // Validate required fields
    if (!studentId || typeof studentId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: studentId' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: message' },
        { status: 400 }
      );
    }

    // Get or create conversation FIRST
    let { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('student_id', studentId)
      .single();

    if (!conversation) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ student_id: studentId })
        .select('id')
        .single();
      conversation = newConv;
    }

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Failed to get or create conversation' },
        { status: 500 }
      );
    }

    // Build student message data with attachments
    const studentMessageData: any = {
      conversation_id: conversation.id,
      role: 'student',
      content: message,
      status: 'sent',
    };

    if (attachments && attachments.length > 0) {
      studentMessageData.attachments = attachments.map(a => ({
        filename: a.filename,
        url: a.publicUrl || '',
        mimeType: a.mimeType,
        storagePath: a.storagePath,
      }));
    }

    // Save student message IMMEDIATELY
    await supabase.from('messages').insert(studentMessageData);
    console.log(`[Chat API] Student message saved for ${studentId}`);

    // Check if this is a conversation-ending message - don't generate AI response
    if (isConversationEnding(message)) {
      console.log('[Chat API] Conversation-ending message detected, not generating response');
      return NextResponse.json({
        success: true,
        noResponseNeeded: true,
        message: 'Message sent successfully',
      });
    }

    // Trigger background AI processing (fire and forget)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const processUrl = `${baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`}/api/agent/process`;

    // Fire and forget - don't await
    fetch(processUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        message,
        attachments,
        conversationId: conversation.id,
      }),
    }).catch(err => console.error('[Chat API] Background processing error:', err));

    // Return success immediately - student doesn't wait for AI
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully. Response will be generated shortly.',
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Note: AI processing now happens in /api/agent/process endpoint
// The POST function above saves the student message immediately and triggers background processing
