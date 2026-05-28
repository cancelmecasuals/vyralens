import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ subscription: null });
    const { supabaseAdmin } = await import('@/lib/supabase');
    const sb = supabaseAdmin();
    const { data } = await sb.from('subscriptions').select('*').eq('user_id', userId).eq('status', 'active').single();
    return NextResponse.json({ subscription: data });
  } catch {
    return NextResponse.json({ subscription: null });
  }
}
