import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Provide Supabase env so importing src/lib/supabase.ts never throws in tests.
// The client itself is mocked per-test; these are just placeholders.
vi.stubEnv("VITE_SUPABASE_URL", "http://localhost");
vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-anon-key");
