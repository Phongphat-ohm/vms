import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { serverConfig, publicConfig } from "@/lib/config";

let browserClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

/**
 * Checks whether Supabase is configured with URL and Keys.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    serverConfig.supabaseUrl &&
      (serverConfig.supabasePublishableKey || serverConfig.supabaseSecretKey)
  );
}

/**
 * Standard Supabase client for client-side and public operations.
 * Uses the modern Publishable Key (or legacy anon key fallback).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window !== "undefined" && browserClient) {
    return browserClient;
  }

  const url = publicConfig.supabaseUrl;
  const key = publicConfig.supabasePublishableKey;

  if (!url || !key) {
    return null;
  }

  const client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  if (typeof window !== "undefined") {
    browserClient = client;
  }

  return client;
}

/**
 * Privileged Supabase Admin client for server-side only operations.
 * Uses the modern Secret Key (or legacy service_role key fallback).
 * Never expose this client to the browser!
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseAdminClient can only be called on the server!");
  }

  if (adminClient) {
    return adminClient;
  }

  const url = serverConfig.supabaseUrl;
  const key = serverConfig.supabaseSecretKey || serverConfig.supabasePublishableKey;

  if (!url || !key) {
    return null;
  }

  adminClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}
