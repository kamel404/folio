"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminConfigured, isSupabaseConfigured } from "@/lib/supabase/env";
import { NOT_CONFIGURED_MESSAGE, SITE_URL } from "@/lib/config";
import { normalizeSlug, validateSlug } from "@/lib/utils/slug";
import { safeNext } from "@/lib/utils/url";

export type FormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  /** Non-sensitive values to repopulate the form after an error */
  values?: Partial<Record<string, string>>;
  /** Set when the form finished without a redirect (e.g. "check your email") */
  success?: string;
};

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "");

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

const passwordRule = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.");

/* ─── Sign up ─── */

const signupSchema = z.object({
  name: z.string().min(2, "Enter your full name.").max(80, "That name is too long."),
  email: z.email("Enter a valid email address."),
  password: passwordRule,
});

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    name: text(formData, "name").trim(),
    email: text(formData, "email").trim().toLowerCase(),
    slug: normalizeSlug(text(formData, "slug")),
    plan: text(formData, "plan"),
  };
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED_MESSAGE, values };

  const parsed = signupSchema.safeParse({ ...values, password: text(formData, "password") });
  const fieldErrors: Record<string, string> = parsed.success ? {} : fieldErrorsFrom(parsed.error);

  const slugCheck = validateSlug(values.slug);
  if (!slugCheck.ok) fieldErrors.slug = slugCheck.reason;
  else if (isAdminConfigured()) {
    const { data: taken } = await createAdminClient()
      .from("tenants")
      .select("id")
      .eq("slug", values.slug)
      .maybeSingle();
    if (taken) fieldErrors.slug = "That address is already taken.";
  }

  if (Object.keys(fieldErrors).length > 0 || !parsed.success) return { fieldErrors, values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name, slug: values.slug, intended_plan: values.plan || null },
      emailRedirectTo: `${SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    // The signup trigger raises when the slug is taken/invalid
    if (/database error|slug/i.test(error.message)) {
      return { fieldErrors: { slug: "That address was just taken. Try another." }, values };
    }
    if (/already registered|already exists/i.test(error.message)) {
      return { fieldErrors: { email: "An account with this email already exists." }, values };
    }
    return { error: error.message, values };
  }

  // Email confirmation off → we already have a session
  if (data.session) redirect("/dashboard");

  return { success: values.email, values };
}

/* ─── Log in ─── */

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function logIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { email: text(formData, "email").trim().toLowerCase() };
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED_MESSAGE, values };

  const parsed = loginSchema.safeParse({ ...values, password: text(formData, "password") });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error), values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      error: /confirm/i.test(error.message)
        ? "Confirm your email first. Check your inbox for the link we sent."
        : "Incorrect email or password.",
      values,
    };
  }

  redirect(safeNext(text(formData, "next")));
}

/* ─── Forgot / reset password ─── */

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { email: text(formData, "email").trim().toLowerCase() };
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED_MESSAGE, values };

  const parsed = z.email("Enter a valid email address.").safeParse(values.email);
  if (!parsed.success) return { fieldErrors: { email: parsed.error.issues[0].message }, values };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
  });

  // Same answer whether or not the account exists (no email enumeration)
  return { success: parsed.data, values };
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED_MESSAGE };

  const password = passwordRule.safeParse(text(formData, "password"));
  if (!password.success) return { fieldErrors: { password: password.error.issues[0].message } };
  if (password.data !== text(formData, "confirm")) {
    return { fieldErrors: { confirm: "Passwords don't match." } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: password.data });
  if (error) {
    return {
      error: /session/i.test(error.message)
        ? "This reset link has expired. Request a new one."
        : error.message,
    };
  }

  redirect("/dashboard");
}

/* ─── Sign out ─── */

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
