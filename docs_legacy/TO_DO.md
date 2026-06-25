Subscriber Page
Yes — now that **key redeem + chapter unlock works**, the core entitlement security spine is alive. Next should be:

## Recommended next phase: Patreon Edge Functions

Because we now have:

- real Supabase auth
- real reader profile/session
- real internal tiers
- real entitlements
- real chapter catalog/content RPCs
- real access-key redemption
- admin tier/key/manual grant flows

…the obvious next major integration is **Patreon account linking + entitlement sync**.

## Order I’d do it in

### 1. Clean up / verify current reader state first
Before Patreon, I’d do one small hardening pass:

- Confirm locked chapter catalog refreshes immediately after key redeem.
- Confirm account sheet shows active entitlements.
- Confirm expired/revoked entitlement removes access.
- Confirm admin-only Studio/Admin CMS links behave correctly.
- Remove/disable remaining obvious mock/demo-only data paths if any are still visible.

This prevents Patreon bugs being confused with old fixture behavior.

---

### 2. Implement Patreon OAuth properly

Current Patreon connect probably only has a starter function. The real version needs:

- `patreon-oauth-start`
  - validates logged-in Supabase user
  - creates secure state token
  - redirects to Patreon OAuth

- `patreon-oauth-callback`
  - validates state
  - exchanges code for Patreon tokens
  - fetches Patreon identity/membership
  - stores provider connection
  - maps Patreon tier/campaign to internal tier
  - writes/updates `user_entitlements`
  - redirects back to `subscription.html#/access/success`

---

### 3. Add Patreon sync function

Separate from connect flow:

- `sync-provider-entitlements`
  - checks current logged-in user
  - finds their Patreon connection
  - refreshes membership/tier status
  - upserts active entitlement
  - expires/revokes missing/cancelled entitlement
  - updates `last_synced_at`

This gives you a manual “Sync Patreon” button and future background sync path.

---

### 4. Add Patreon webhook later, not first

Webhook is useful, but I would not do it before OAuth sync is working.

Reason: webhook setup has more moving parts — Patreon dashboard config, signature verification, campaign/member payload quirks, replay protection, etc.

So:

1. OAuth connect
2. manual sync
3. webhook

That is less pain.

---

### 5. Then production cleanup/refactor

After Patreon works:

- Split `aether-app.js` monolith into modules.
- Remove remaining local fixture dependency from production routes.
- Tighten loading/error states.
- Polish admin access management UX.
- Add provider mapping UI improvements.
- Add deployment docs for Supabase functions/secrets.

## My recommendation

Next task should be:

> **Implement Patreon OAuth callback + entitlement sync Edge Function path.**

But before touching that, we should quickly inspect the existing `supabase/functions/` files and patch them into a real working OAuth/sync flow.


_____
Web_handling

PMPro is worth considering — but **not as the reader backend itself**. It’s a **WordPress membership/payment engine**, while your stack is vanilla JS + Supabase. So the sane way to use it would be as a **payment/membership sidecar**, not as the core reader authorization system.

What I found publicly:

- PMPro is open-source/GPL and built for membership sites, premium content, subscriptions, newsletters, etc. Its GitHub README says users can select a level, checkout, become members, view payments, update billing, and cancel from the site. Source: [GitHub repo](https://github.com/strangerstudios/paid-memberships-pro).
- Docs expose concepts we’d want: membership levels, members, orders, subscriptions, discount codes, frontend account/billing/checkout pages, restricting content, developer hooks/filters/API. Source: [PMPro docs index](https://www.paidmembershipspro.com/documentation/).
- Core/recommended gateways include Stripe and PayPal; other listed gateways include Paystack, CCBill, Payfast, and manual payment. Source: [PMPro payment gateways](https://www.paidmembershipspro.com/gateway/).
- PMPro + Stripe supports Stripe Checkout / Elements and recurring subscriptions. Source: [PMPro Stripe page](https://www.paidmembershipspro.com/gateway/stripe/).
- PMPro + PayPal supports PayPal-hosted checkout, guest cards, webhooks, recurring subscriptions, and admin refunds. Source: [PMPro PayPal page](https://www.paidmembershipspro.com/gateway/paypal-payments/).
- If a gateway isn’t supported, PMPro explicitly points to either building a new gateway or using WooCommerce as the payment gateway layer. Source: [PMPro payment gateways](https://www.paidmembershipspro.com/gateway/).

## My take for your project

### PMPro is useful if you want:

- ready-made membership checkout;
- membership level management;
- coupons/discount codes;
- billing/account pages;
- recurring subscriptions;
- payment history;
- cancellation flows;
- WordPress-side admin for payments;
- less custom payment code.

### PMPro is not ideal if you want:

- a pure Supabase-native architecture;
- no WordPress server;
- direct control over all provider webhooks;
- Razorpay/UPI-first India payments without WooCommerce/custom gateway work;
- one clean backend instead of WordPress + Supabase bridge.

## India/payment concern

Your instinct is right. For India, PMPro’s default gateway story may be awkward.

PMPro seems strongest with:

- Stripe;
- PayPal;
- maybe Paystack/Payfast depending region;
- manual payment;
- WooCommerce gateway fallback.

But for India, the most natural payment options are often:

- Razorpay;
- Cashfree;
- PhonePe;
- PayU;
- UPI / UPI Autopay;
- cards/netbanking/wallets.

I did **not** find Razorpay listed as a first-class PMPro gateway in the public pages I checked. That means Razorpay would likely require one of:

1. **WooCommerce bridge**  
   PMPro → WooCommerce checkout → Razorpay WooCommerce plugin → PMPro membership granted.

2. **Custom PMPro gateway**  
   Build a Razorpay gateway adapter for PMPro.

3. **Skip PMPro for India payments**  
   Use Razorpay directly with Supabase Edge Functions.

## Best architecture option if using PMPro

Use PMPro only as a **payment provider / entitlement source**.

```txt
Reader SPA
  ↓
Supabase Auth + Entitlements
  ↓
Secure chapter RPCs

PMPro WordPress sidecar
  ↓
Checkout / billing / subscriptions
  ↓
Signed webhook bridge
  ↓
Supabase provider-webhook Edge Function
  ↓
Normalized user_entitlements
```

Meaning:

- PMPro handles payment checkout.
- Supabase remains the real authorization source.
- Reader SPA never asks WordPress “can I show this chapter?”
- WordPress/PMPro only sends signed events like:
  - membership started;
  - membership changed;
  - subscription renewed;
  - payment failed;
  - membership cancelled;
  - refund issued;
  - membership expired.

Then Supabase converts those into your normalized entitlement system.

## How PMPro should map into our model

PMPro membership levels become internal reader tiers:

```txt
PMPro Level ID 1 -> Aether Member
PMPro Level ID 2 -> Archivist Tier
PMPro Level ID 3 -> Founder / Patron Tier
```

Supabase receives:

```txt
provider: "pmpro"
provider_user_id: WordPress user ID
provider_subscription_id: PMPro subscription/order ID
provider_tier_id: PMPro level ID
internal_tier_id: mapped reader_access_tiers.id
status: active / cancelled / expired / payment_failed
valid_from
valid_until
```

## My recommendation

For your setup:

### Best practical stack

Use **Supabase entitlement core** no matter what.

Then support multiple payment/provider adapters:

```txt
Patreon adapter
Ko-fi adapter
PayPal adapter
Razorpay adapter
PMPro adapter
Manual grant adapter
Access key adapter
Discord adapter
```

### Payment priority

For India:

1. **Razorpay native Supabase adapter** — best for INR/UPI/local payments.
2. **Patreon** — good for international supporter culture.
3. **Ko-fi/PayPal** — good secondary international options.
4. **PMPro sidecar** — useful if you want a WordPress-powered checkout/admin system.
5. **Manual grants/access keys** — always keep these; they save your ass during payment weirdness.

## Bottom line

PMPro is a good addition **as an optional payment/membership sidecar**, not as the main backend.

I would not let PMPro dictate the reader architecture. The reader should stay:

```txt
Aether Pages UI + Supabase Auth + Supabase Entitlements + Secure RPC Chapter Access
```

PMPro can become just another provider feeding entitlements into Supabase.

If you get the official/private docs, the most important things to look for are:

- hooks fired on membership level change;
- hooks fired on cancellation/expiration/payment failure;
- REST/API access;
- webhook support;
- Razorpay/WooCommerce compatibility;
- subscription lifecycle events;
- user identity mapping options.
----------


Reader SPA

-Migration from supabase to cloudfare r2
-tagging images and uploading them to github/site/db
