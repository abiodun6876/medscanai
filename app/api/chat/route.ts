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
- For measurement questions, explain what normal ranges are
- For ROI analysis, explain what density values indicate
- For comparison questions, highlight clinically significant changes

Important disclaimers:
- Remind users that you're an AI assistant
- Always advise consulting a healthcare provider for clinical decisions
- Don't interpret findings beyond what's provided in the context

Available features to reference:
- Distance, angle, and area measurements
- ROI (Region of Interest) density analysis
- Anatomical landmark detection
- Side-by-side comparison with prior studies
- Image enhancement (brightness/contrast)
- DICOM window leveling for CT/MRI`;

export async function POST(req: NextRequest) {
  try {
    const { question, context, measurements, roiData, landmarks, comparisonData } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 });
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({
        answer: "I'm sorry, the AI assistant is currently unavailable. Please consult your healthcare provider for questions about your scan results."
      });
    }

    // Build enhanced context with available data
    let enhancedContext = context || '';
    
    if (measurements && measurements.length > 0) {
      enhancedContext += `\n\nMeasurements taken:\n${measurements.map((m: any) => 
        `- ${m.type}: ${m.value} ${m.unit}`
      ).join('\n')}`;
    }
    
    if (roiData) {
      enhancedContext += `\n\nROI Analysis:\n- Mean density: ${roiData.mean} HU\n- Min: ${roiData.min} HU\n- Max: ${roiData.max} HU\n- Standard deviation: ${roiData.std} HU\n- Area: ${roiData.area} pixels`;
    }
    
    if (landmarks && landmarks.length > 0) {
      enhancedContext += `\n\nDetected landmarks:\n${landmarks.map((l: any) => 
        `- ${l.name} (confidence: ${(l.confidence * 100).toFixed(0)}%)`
      ).join('\n')}`;
    }
    
    if (comparisonData) {
      enhancedContext += `\n\nComparison with prior study:\n${comparisonData.findings || 'Changes detected'}`;
    }

    const userPrompt = `Here is the scan information and any measurements taken:\n\n${enhancedContext}\n\nUser Question: ${question}\n\nAnswer the user's question based on the scan information above. If measurements are provided, explain their clinical significance. If ROI data is available, explain what the density values mean. Always include a disclaimer to consult a physician.`;

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
        max_tokens: 800,
        messages: [
          { role: 'system', content: CHAT_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat API error:', response.status, errorText);
      
      // Provide more specific error messages
      if (response.status === 401) {
        return NextResponse.json({
          answer: "I'm having authentication issues. Please check that the API key is configured correctly."
        });
      } else if (response.status === 429) {
        return NextResponse.json({
          answer: "The AI service is currently busy. Please wait a moment and try again."
        });
      } else {
        return NextResponse.json({
          answer: "I'm having trouble connecting right now. Please try again in a moment, or consult your healthcare provider."
        });
      }
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid API response structure:', data);
      return NextResponse.json({
        answer: "I received an unexpected response. Please try again."
      });
    }
    
    let answer = data.choices[0].message.content;

    // Add disclaimer if not already included
    const hasDisclaimer = answer.includes('physician') || 
                         answer.includes('doctor') || 
                         answer.includes('healthcare provider') ||
                         answer.includes('medical professional');
    
    if (!hasDisclaimer) {
      answer = `${answer}\n\n⚠️ **Remember**: This AI analysis is for informational purposes only. Always consult a qualified healthcare provider for medical advice, diagnosis, or treatment.`;
    }

    // Add measurement reference if measurements were provided
    if (measurements && measurements.length > 0 && !answer.includes('measurement')) {
      answer = `${answer}\n\n📏 *Measurements were used in this analysis. Normal ranges may vary based on patient factors.*`;
    }

    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json({
      answer: "An error occurred while processing your request. Please try again later or consult your healthcare provider directly."
    });
  }
}

// Handle OPTIONS for CORS preflight
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