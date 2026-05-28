import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
    }

    // Strip all non-ASCII characters that break HTTP headers
    const apiKey = process.env.ANTHROPIC_API_KEY.replace(/[^\x00-\x7F]/g, '').trim();

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Anthropic error:', data);
      return NextResponse.json({ error: data.error?.message || 'API error', result: '' }, { status: 500 });
    }

    const result = data.content?.[0]?.text || 'No response generated.';
    const response = NextResponse.json({ result });
    response.headers.set('Cache-Control', 'no-store');
    return response;

  } catch (err: any) {
    console.error('Analyze route error:', err);
    return NextResponse.json({ error: err.message || 'Analysis failed', result: '' }, { status: 500 });
  }
}
