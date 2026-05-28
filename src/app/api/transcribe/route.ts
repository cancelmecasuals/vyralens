import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, videoId, platform, caption } = await req.json();
    const apiKey = process.env.ASSEMBLYAI_API_KEY?.replace(/[^\x00-\x7F]/g, '').trim();

    if (!apiKey) return NextResponse.json({ transcript: null, error: 'No AssemblyAI key' });

    // For platforms without direct video URL, return caption as transcript
    if (!videoUrl && caption) {
      return NextResponse.json({ transcript: caption, source: 'caption' });
    }

    // Build audio URL based on platform
    let audioUrl = videoUrl;
    if (platform === 'YouTube' && videoId) {
      audioUrl = `https://www.youtube.com/watch?v=${videoId}`;
    }

    if (!audioUrl) return NextResponse.json({ transcript: null, error: 'No audio URL' });

    // Submit to AssemblyAI
    const submitRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: { 'authorization': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        audio_url: audioUrl,
        auto_highlights: true,
      }),
    });

    const submitData = await submitRes.json();
    if (submitData.error) return NextResponse.json({ transcript: null, error: submitData.error });

    const transcriptId = submitData.id;

    // Poll for up to 55 seconds
    for (let i = 0; i < 27; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { 'authorization': apiKey },
      });
      const pollData = await pollRes.json();

      if (pollData.status === 'completed') {
        return NextResponse.json({
          transcript: pollData.text,
          source: 'audio',
          highlights: pollData.auto_highlights_result?.results?.slice(0, 10) || [],
        });
      }
      if (pollData.status === 'error') {
        // Fall back to caption if transcription fails
        return NextResponse.json({ transcript: caption || null, error: pollData.error, source: 'caption_fallback' });
      }
    }

    // Timeout — fall back to caption
    return NextResponse.json({ transcript: caption || null, source: 'caption_fallback', error: 'Transcription timed out' });

  } catch (err: any) {
    return NextResponse.json({ transcript: null, error: err.message });
  }
}
