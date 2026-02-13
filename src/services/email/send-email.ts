/**
 * Email Service
 * Send emails using Resend API (HTTP-based, works on Railway)
 */

interface WelcomeEmailParams {
  to: string;
  preferredName: string;
  email: string;
  password: string;
}

export async function sendWelcomeEmail({
  to,
  preferredName,
  email,
  password,
}: WelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  const loginUrl = 'https://vizuara-genai-assistant-production.up.railway.app/student';

  const emailContent = `Hello ${preferredName}!

Let us get started with the Generative AI Bootcamp.

Login here: ${loginUrl}

Email: ${email}
Password: ${password}

When you log in to this website, you will already see an onboarding email with the next steps of action. All our communication will happen on this website.

Let us get started.

Best regards,
Dr Raj Dandekar`;

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return {
      success: false,
      error: 'Email service not configured. Please set RESEND_API_KEY environment variable.',
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Dr Raj Dandekar <onboarding@resend.dev>',
        to: [to],
        subject: "Let's get started",
        text: emailContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return {
        success: false,
        error: errorData.message || 'Failed to send email',
      };
    }

    const data = await response.json();
    console.log('Email sent successfully:', data.id);
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
