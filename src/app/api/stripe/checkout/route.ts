import { NextRequest, NextResponse } from 'next/server';
import { PLANS } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { planId, userId, userEmail } = await req.json();
    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?subscribed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      metadata: { userId, planId },
      subscription_data: { metadata: { userId, planId } },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
