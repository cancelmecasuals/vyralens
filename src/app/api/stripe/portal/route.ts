import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
