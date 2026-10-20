import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteTag } from "@/lib/supabase/public";
import { parseSubscription, verifyWebhookSignature } from "@/lib/payments/lemon-squeezy";
import { applySubscription } from "@/lib/payments/subscriptions";

/**
 * POST /api/webhooks/lemon-squeezy
 *
 * Every subscription_* event carries the full subscription, so each one is
 * handled the same way: store the snapshot and set the tenant's plan from it
 * (apply_subscription ignores stale and superseded snapshots, so retries and
 * out-of-order deliveries are harmless). Other events (orders, invoices) are
 * logged and acknowledged.
 *
 * Responses: 401 bad signature · 400 unreadable body · 500 our failure
 * (Lemon Squeezy retries) · 200 everything else, including events we
 * deliberately ignore (retrying those would never help).
 */

const metaSchema = z.object({
  event_name: z.string(),
  test_mode: z.boolean().optional(),
  custom_data: z.object({ tenant_id: z.unknown() }).partial().loose().nullish(),
});

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyWebhookSignature(raw, request.headers.get("x-signature"))) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: { meta?: unknown; data?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const meta = metaSchema.safeParse(body.meta);
  if (!meta.success) return Response.json({ error: "Missing meta" }, { status: 400 });
  const { event_name: event, test_mode = false, custom_data } = meta.data;

  const admin = createAdminClient();
  const log = (outcome: string, extra: { ls_subscription_id?: string; tenant_id?: string } = {}) =>
    admin
      .from("payment_events")
      .insert({ event_name: event, test_mode, outcome, payload: body, ...extra })
      .then(({ error }) => error && console.error("[webhook] could not log event", error));

  const snapshot = event.startsWith("subscription_") ? parseSubscription(body.data) : null;
  if (!snapshot) {
    // order_created, subscription_payment_* (invoices) … the matching subscription_updated carries the state
    await log("ignored");
    return Response.json({ ok: true, outcome: "ignored" });
  }

  try {
    // The tenant: from the checkout's custom data, or the subscription we already know
    let tenantId = z.uuid().safeParse(custom_data?.tenant_id).data ?? null;
    if (!tenantId) {
      const { data } = await admin
        .from("subscriptions")
        .select("tenant_id")
        .eq("ls_subscription_id", snapshot.id)
        .maybeSingle<{ tenant_id: string }>();
      tenantId = data?.tenant_id ?? null;
    }
    const { data: tenant, error: tenantError } = tenantId
      ? await admin.from("tenants").select("id, slug").eq("id", tenantId).maybeSingle<{ id: string; slug: string }>()
      : { data: null, error: null };
    if (tenantError) throw tenantError;

    if (!tenant) {
      console.error(`[webhook] ${event} for subscription ${snapshot.id}: no matching tenant`);
      await log("unknown_tenant", { ls_subscription_id: snapshot.id });
      return Response.json({ ok: true, outcome: "unknown_tenant" });
    }

    const outcome = await applySubscription(tenant.id, snapshot);
    if (outcome === "unknown_variant") {
      console.error(`[webhook] ${event}: variant ${snapshot.variantId} isn't one of the LEMON_SQUEEZY_VARIANT_* ids`);
    }
    await log(outcome, { ls_subscription_id: snapshot.id, tenant_id: tenant.id });

    if (outcome === "applied") {
      // Route Handler: updateTag isn't allowed here. expire: 0 = the next visit renders fresh.
      revalidateTag(siteTag(tenant.slug), { expire: 0 });
      revalidatePath("/dashboard", "layout");
    }
    return Response.json({ ok: true, outcome });
  } catch (error) {
    console.error(`[webhook] ${event} for subscription ${snapshot.id}`, error);
    await log("error", { ls_subscription_id: snapshot.id });
    return Response.json({ error: "Could not process the event" }, { status: 500 });
  }
}
