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
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/login",
      "Email and password are required",
    );
  }

  // Możesz dodać też walidację długości hasła tutaj, jeśli chcesz
  if (password.length < 8) {
    return encodedRedirect(
      "error",
      "/login",
      "Password must be at least 8 characters",
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/login", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/login",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log(error);

  if (error) {
    return encodedRedirect("error", "/login", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/login", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/login`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect("error", "/login", "Could not reset password");
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/login",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/login",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect("error", "/login", "Passwords do not match");
  }

  // Tutaj możesz dodać dodatkową walidację hasła (np. min. 8 znaków)
  if (password.length < 8) {
    return encodedRedirect(
      "error",
      "/login",
      "Password must be at least 8 characters",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect("error", "/login", "Password update failed");
  }

  return encodedRedirect("success", "/login", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/login");
};

export const signInWithGoogleAction = async () => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect("error", "/login", error.message);
  }

  if (data?.url) {
    return redirect(data.url);
  }

  return encodedRedirect(
    "error",
    "/login",
    "Failed to initiate Google sign in",
  );
};

export const signInWithAppleAction = async () => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect("error", "/login", error.message);
  }

  if (data?.url) {
    return redirect(data.url);
  }

  return encodedRedirect("error", "/login", "Failed to initiate Apple sign in");
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
});

const plans = {
  basic: { priceId: "price_1RDmnnGagz5xt87zdGOBSdAq", tokens: 5 },
  standard: { priceId: "price_1RDmnnGagz5xt87zMiITvleK", tokens: 9 },
  professional: { priceId: "price_1RDmnnGagz5xt87zVFG3g5Zz", tokens: 15 },
  ultimate: { priceId: "price_1RDmnnGagz5xt87zVFG3g5Zz", tokens: 22 },
};

export const createCheckoutSession = async (
  plan: string,
  cvId: string,
  lang: string,
) => {
  const supabase = await createClient();

  const config = plans[plan as keyof typeof plans];

  if (!config) throw new Error("Invalid plan");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{ price: config.priceId, quantity: 1 }],
    metadata: {
      user_id: supabase.auth._getUser()?.id,
      plan,
      tokens: config.tokens,
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cv-preview?cvId=${cvId}&lang=${lang}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscriptions?cvId=${cvId}&lang=${lang}`,
  });

  redirect(session.url!);
};
