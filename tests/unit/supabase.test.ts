import { describe, it, expect } from "vitest";
import {
  isSupabaseConfigured,
  getSupabaseClient,
  getSupabaseAdminClient,
} from "@/lib/supabase";

describe("Supabase Integration Unit Tests", () => {
  it("should confirm Supabase is configured when URL and Keys are present", () => {
    expect(isSupabaseConfigured()).toBe(true);
  });

  it("should initialize client-side Supabase client with publishable key", () => {
    const client = getSupabaseClient();
    expect(client).not.toBeNull();
    expect(client?.storage).toBeDefined();
    expect(client?.auth).toBeDefined();
  });

  it("should initialize server-side Supabase admin client with secret key", () => {
    const admin = getSupabaseAdminClient();
    expect(admin).not.toBeNull();
    expect(admin?.storage).toBeDefined();
    expect(admin?.auth).toBeDefined();
  });
});
