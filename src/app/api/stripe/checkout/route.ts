import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { planId, userId, userEmail } = await req.json();

    const stripeKey = process.env.STRIPE_SECRET_KEY?.replace(/[^\x00-\x7F]/g, '').trim();
    if (!stripeKey) return NextResponse.json({ error: 'Missing Stripe key' }, { status: 500 });

    const priceIds: Record<string, string | undefined> = {
      creator: process.env.STRIPE_CREATOR_PRICE_ID?.trim(),
      pro: process.env.STRIPE_PRO_PRICE_ID?.trim(),
      agency: process.env.STRIPE_AGENCY_PRICE_ID?.trim(),
    };

    const priceId = priceIds[planId];
    if (!priceId) {
      console.error('Missing priceId for', planId, JSON.stringify({
        creator: !!process.env.STRIPE_CREATOR_PRICE_ID,
        pro: !!process.env.STRIPE_PRO_PRICE_ID,
        agency: !!process.env.STRIPE_AGENCY_PRICE_ID,
      }));
      return NextResponse.json({ error: `No price ID for plan: ${planId}` }, { status: 400 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vyralens.vercel.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard?subscribed=true`,
      cancel_url: `${siteUrl}/pricing`,
      metadata: { userId, planId },
      subscription_data: { metadata: { userId, planId } },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout error:', err?.message, err?.type);
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 });
  }
}
