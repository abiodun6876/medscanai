import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      return NextResponse.json({
        answer: 'AI chat is not configured. Please add your API key to enable this feature.',
      });
    }

    const baseURL = (process.env.ANTHROPIC_BASE_URL || 'https://cc.freemodel.dev').replace(/\/$/, '');

    const body = await req.json() as { question: string; context: string };
    const { question, context } = body;

    if (!question?.trim()) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 });
    }

    const systemContext = `You are MedScan AI, a helpful medical assistant. You are answering questions about a specific scan report.
    
SCAN CONTEXT:
${context}

IMPORTANT RULES:
- Answer concisely but thoroughly (2-4 sentences max unless a longer answer is clearly warranted)
- Use plain language that a patient can understand, but be medically accurate
- Always add a brief disclaimer at the end: "⚠ This is AI pre-screening — consult your physician for clinical decisions."
- Do not make definitive diagnoses — only explain findings and provide educational context`;

    const apiRes = await fetch(`${baseURL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'Authorization':     `Bearer ${apiKey}`,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 1024,
        system:     systemContext,
        messages: [
          { role: 'user', content: `Patient question: ${question}` },
        ],
      }),
    });

    const rawBody = await apiRes.text();

    if (!apiRes.ok) {
      console.error('[MedScan Chat] API error:', apiRes.status, rawBody.slice(0, 200));
      return NextResponse.json({ answer: 'Sorry, the AI service is temporarily unavailable. Please try again.' });
    }

    let apiData: { content?: { type: string; text: string }[] };
    try {
      apiData = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ answer: 'Sorry, I encountered an error. Please try again.' });
    }

    const answer = apiData?.content?.[0]?.type === 'text' ? apiData.content[0].text.trim() : '';
    return NextResponse.json({ answer });

  } catch (error) {
    console.error('[MedScan Chat error]', error);
    return NextResponse.json({
      answer: 'Sorry, I encountered an error processing your question. Please try again.',
    });
  }
}
