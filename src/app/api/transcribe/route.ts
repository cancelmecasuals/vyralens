import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, videoId, platform } = await req.json();
    const apiKey = process.env.ASSEMBLYAI_API_KEY?.replace(/[^\x00-\x7F]/g, '').trim();

    if (!apiKey) {
      return NextResponse.json({ transcript: null, error: 'No AssemblyAI key' });
    }

    // For YouTube — use youtube captions approach via video URL
    let audioUrl = videoUrl;

    // For YouTube specifically, use a public audio URL format
    if (platform === 'YouTube' && videoId) {
      audioUrl = `https://www.youtube.com/watch?v=${videoId}`;
    }

    if (!audioUrl) {
      return NextResponse.json({ transcript: null, error: 'No audio URL available' });
    }

    // Submit transcription job
    const submitRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        auto_highlights: true,
        sentiment_analysis: true,
      }),
    });

    const submitData = await submitRes.json();
    if (submitData.error) {
      return NextResponse.json({ transcript: null, error: submitData.error });
    }

    const transcriptId = submitData.id;

    // Poll for completion (max 30 seconds)
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { 'authorization': apiKey },
      });
      const pollData = await pollRes.json();

      if (pollData.status === 'completed') {
        return NextResponse.json({
          transcript: pollData.text,
          highlights: pollData.auto_highlights_result?.results?.slice(0, 10) || [],
          sentiment: pollData.sentiment_analysis_results?.slice(0, 5) || [],
        });
      }

      if (pollData.status === 'error') {
        return NextResponse.json({ transcript: null, error: pollData.error });
      }
    }

    return NextResponse.json({ transcript: null, error: 'Transcription timed out' });

  } catch (err: any) {
    return NextResponse.json({ transcript: null, error: err.message });
  }
}
