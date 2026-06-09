import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';

const CHAT_SYSTEM_PROMPT = `You are MedScan AI, a helpful radiology AI assistant. You help patients and doctors understand medical scan reports in plain language.

Guidelines:
- Explain medical terms simply and clearly
- Never give definitive diagnoses — always recommend consulting a physician
- Be empathetic and reassuring
- Reference the specific findings from the scan context provided
- Keep responses concise (2-4 sentences usually)
- If you don't know something, say so honestly

Important disclaimers:
- Remind users that you're an AI assistant
- Always advise consulting a healthcare provider for clinical decisions
- Don't interpret findings beyond what's provided in the context`;

export async function POST(req: NextRequest) {
  try {
    const { question, context } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 });
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({
        answer: "I'm sorry, the AI assistant is currently unavailable. Please consult your healthcare provider for questions about your scan results."
      });
    }

    const userPrompt = `Here is the scan information:\n\n${context}\n\nUser Question: ${question}\n\nAnswer the user's question based on the scan information above. Be helpful, accurate, and always include a disclaimer to consult a physician.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://medscanai-amber.vercel.app',
        'X-Title': 'MedScan AI Chat',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        max_tokens: 500,
        messages: [
          { role: 'system', content: CHAT_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('Chat API error:', response.status);
      return NextResponse.json({
        answer: "I'm having trouble connecting right now. Please try again in a moment, or consult your healthcare provider."
      });
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    // Add a default disclaimer if not already included
    const finalAnswer = answer.includes('physician') || answer.includes('doctor')
      ? answer
      : `${answer}\n\n⚠️ Remember: Always consult a qualified healthcare provider for medical advice.`;

    return NextResponse.json({ answer: finalAnswer });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json({
      answer: "An error occurred. Please try again later or consult your healthcare provider directly."
    });
  }
}

// Optional: Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}