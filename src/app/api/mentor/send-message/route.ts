/**
 * Mentor Direct Message API
 * POST /api/mentor/send-message - Send a message directly from mentor to student
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Attachment {
  filename: string;
  url: string;
  mimeType: string;
  storagePath: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, content, attachments } = body as {
      studentId: string;
      content: string;
      attachments?: Attachment[];
    };

    if (!studentId || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: studentId, content' },
        { status: 400 }
      );
    }

    console.log(`[Mentor API] Sending direct message to student ${studentId}`);
    if (attachments && attachments.length > 0) {
      console.log(`[Mentor API] With ${attachments.length} attachment(s):`, attachments.map(a => a.filename));
    }

    // Get or create conversation for this student
    let { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('student_id', studentId)
      .single();

    if (!conversation) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ student_id: studentId })
        .select('id')
        .single();

      if (convError) {
        throw new Error(`Failed to create conversation: ${convError.message}`);
      }
      conversation = newConv;
    }

    // Insert the message as 'approved' (already sent, from mentor)
    // Include attachments if provided
    const messageData: any = {
      conversation_id: conversation.id,
      role: 'agent', // Shows as Dr. Raj
      content: content,
      status: 'approved', // Directly sent, no draft needed
    };

    if (attachments && attachments.length > 0) {
      messageData.attachments = attachments;
    }

    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (msgError) {
      throw new Error(`Failed to send message: ${msgError.message}`);
    }

    console.log(`[Mentor API] Message sent successfully: ${message.id}`);

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      messageId: message.id,
    });
  } catch (error) {
    console.error('Send message API error:', error);

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
