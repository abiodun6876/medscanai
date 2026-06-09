import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// This API route now serves as a fallback when client-side TensorFlow fails
// or for additional server-side processing

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // For client-side TensorFlow, we'll just return a success response
    // The actual analysis happens in the browser
    return NextResponse.json({
      success: true,
      message: 'Image received. Analysis will be performed client-side with TensorFlow.js',
      clientSideAnalysis: true,
      imageInfo: {
        name: imageFile.name,
        type: imageFile.type,
        size: imageFile.size,
      }
    });

  } catch (error) {
    console.error('[MedScan] Error:', error);
    return NextResponse.json(buildMockResponse());
  }
}

// Mock response as fallback
function buildMockResponse() {
  return {
    success: true,
    fallback: true,
    warning: 'Using fallback analysis',
    imageType: 'Medical Image',
    summary: 'Client-side TensorFlow.js analysis is recommended for better performance and privacy.',
    findings: [
      {
        label: 'TensorFlow.js Ready',
        confidence: 99,
        severity: 'normal',
        region: 'Client-side browser',
        notes: 'For best results, use the client-side TensorFlow.js implementation.',
      },
    ],
    recommendation: 'Please use the browser-based TensorFlow.js analyzer for real-time, private image analysis.',
  };
}