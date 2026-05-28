import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder');
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  const { supabaseAdmin } = await import('@/lib/supabase');
  const sb = supabaseAdmin();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const { userId, planId } = session.metadata || {};
    if (userId) {
      await sb.from('subscriptions').upsert({
        user_id: userId, plan_id: planId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        status: 'active', updated_at: new Date().toISOString(),
      });
    }
  }
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any;
    await sb.from('subscriptions').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('stripe_subscription_id', sub.id);
  }
  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as any;
    await sb.from('subscriptions').update({ status: sub.status, updated_at: new Date().toISOString() }).eq('stripe_subscription_id', sub.id);
  }

  return NextResponse.json({ received: true });
}
