"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const encodedRedirect = (
  status: "error" | "success",
  destination: string,
  message: string,
) => {
  const encodedMessage = encodeURIComponent(message);
  return redirect(`${destination}?status=${status}&message=${encodedMessage}`);
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const cvId = formData.get("cvId")?.toString();
  const lang = formData.get("lang")?.toString();
  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/login",
      "Email and password are required",
    );
  }

  if (password.length < 8) {
    return encodedRedirect(
      "error",
      "/login",
      "Password must be at least 8 characters",
    );
  }

  const redirectPath =
    cvId && lang ? `/cv-preview?cvId=${cvId}&lang=${lang}` : "/dashboard";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?redirect_to=${encodeURIComponent(redirectPath)}`,
    },
  });

  if (error) {
    return encodedRedirect("error", "/login", error.message);
  }

  return encodedRedirect(
    "success",
    "/login",
    "Check your email to confirm your account.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const cvId = formData.get("cvId")?.toString();
  const lang = formData.get("lang")?.toString();
  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/login",
      "Email and password are required",
    );
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return encodedRedirect("error", "/login", error.message);
  }

  const redirectTo =
    cvId && lang ? `/cv-preview?cvId=${cvId}&lang=${lang}` : "/dashboard";

  return redirect(redirectTo);
};

export const signInWithGoogleAction = async (formData: FormData) => {
  const cvId = formData.get("cvId") as string;
  const lang = formData.get("lang") as string;
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_BASE_URL!;

  const redirectPath =
    cvId && lang ? `/cv-preview?cvId=${cvId}&lang=${lang}` : `/dashboard`;

  const redirectUrl = encodeURIComponent(redirectPath);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?redirect_to=${redirectUrl}`,
    },
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect("error", "/login", error.message);
  }

  if (!data.url) {
    return encodedRedirect("error", "/login", "No URL returned from Supabase");
  }

  return redirect(data.url);
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const cvId = formData.get("cvId")?.toString();
  const lang = formData.get("lang")?.toString();
  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  if (!email) {
    return encodedRedirect("error", "/login", "Email is required");
  }

  const resetPath = `/protected/reset-password${cvId && lang ? `?cvId=${cvId}&lang=${lang}` : ""}`;
  const redirectTo = `${origin}/auth/callback?type=recovery&redirect_to=${encodeURIComponent(resetPath)}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.error(error);
    return encodedRedirect(
      "error",
      "/login",
      "Password reset failed. Try again.",
    );
  }

  return encodedRedirect(
    "success",
    "/login",
    "Check your email for a reset link.",
  );
};

export async function resetPasswordAction(formData: FormData) {
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();
  const cvId = formData.get("cvId")?.toString() || "";
  const lang = formData.get("lang")?.toString() || "";

  console.log("cvId", cvId);
  console.log("lang", lang);
  console.log("password", password);
  console.log("confirm password", confirmPassword);

  const basePath = `/protected/reset-password${cvId && lang ? `?cvId=${cvId}&lang=${lang}` : ""}`;
  const successPath =
    cvId && lang ? `/cv-preview?cvId=${cvId}&lang=${lang}` : "/login";

  if (!password || !confirmPassword) {
    return redirect(
      buildRedirectUrl(
        basePath,
        "error",
        "Password and confirmation are required",
      ),
    );
  }
  if (password !== confirmPassword) {
    return redirect(
      buildRedirectUrl(basePath, "error", "Passwords do not match"),
    );
  }
  if (password.length < 8) {
    return redirect(
      buildRedirectUrl(
        basePath,
        "error",
        "Password must be at least 8 characters",
      ),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return redirect(
      buildRedirectUrl(
        basePath,
        "error",
        error.message || "Password update failed",
      ),
    );
  }

  return redirect(
    buildRedirectUrl(
      successPath,
      "success",
      "Password updated successfully. You can now log in.",
    ),
  );
}

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/login");
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const plans = {
  basic: { priceId: "price_1RDmnnGagz5xt87zdGOBSdAq", tokens: 5 },
  standard: { priceId: "price_1RDmnnGagz5xt87zMiITvleK", tokens: 9 },
  professional: { priceId: "price_1RDmnnGagz5xt87zVFG3g5Zz", tokens: 15 },
  ultimate: { priceId: "price_1RDmnnGagz5xt87zVFG3g5Zz", tokens: 22 },
};

export const createCheckoutSession = async (
  plan: string,
  cvId?: string | null,
  lang?: string | null,
) => {
  const supabase = await createClient();

  const config = plans[plan as keyof typeof plans];

  if (!config) throw new Error("Invalid plan");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const successUrl = cvId
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/cv-preview?cvId=${cvId}&lang=${lang}&paymentPending=true`
    : `${process.env.NEXT_PUBLIC_BASE_URL}`;

  const cancelUrl = cvId
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/subscriptions?cvId=${cvId}&lang=${lang}`
    : `${process.env.NEXT_PUBLIC_BASE_URL}/subscriptions`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{ price: config.priceId, quantity: 1 }],
    metadata: {
      user_id: user.id,
      plan,
      tokens: config.tokens,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  redirect(session.url!);
};

function buildRedirectUrl(path: string, status: string, message: string) {
  const delim = path.includes("?") ? "&" : "?";
  const params = new URLSearchParams({
    status,
    message,
  }).toString();
  return `${path}${delim}${params}`;
}
