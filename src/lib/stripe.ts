import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export const PLANS = {
  creator: {
    name: 'Creator',
    price: 39,
    priceId: process.env.STRIPE_CREATOR_PRICE_ID!,
    features: ['3 platforms', '50 searches/month', 'AI hook analysis', 'Script generator', 'Save up to 50 posts'],
  },
  pro: {
    name: 'Pro',
    price: 99,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: ['All 4 platforms', 'Unlimited searches', 'Trending Now feed', 'Competitor tracker', 'Content calendar', 'Performance predictor', 'Voice learning'],
  },
  agency: {
    name: 'Agency',
    price: 199,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID!,
    features: ['Everything in Pro', '5 team seats', 'White-label scripts', 'API access', 'Priority support'],
  },
};
