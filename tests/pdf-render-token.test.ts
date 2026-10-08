import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPdfRenderToken,
  verifyPdfRenderToken,
} from "@/lib/pdf-render-token";

describe("PDF render token", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "test-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("verifies for the CV it was issued for", () => {
    const token = createPdfRenderToken("cv-1");
    expect(verifyPdfRenderToken("cv-1", token)).toBe(true);
  });

  it("does not verify for another CV", () => {
    const token = createPdfRenderToken("cv-1");
    expect(verifyPdfRenderToken("cv-2", token)).toBe(false);
  });

  it("expires after two minutes", () => {
    vi.useFakeTimers();
    const token = createPdfRenderToken("cv-1");
    vi.advanceTimersByTime(2 * 60 * 1000 + 1);
    expect(verifyPdfRenderToken("cv-1", token)).toBe(false);
  });

  it("rejects a tampered signature", () => {
    const token = createPdfRenderToken("cv-1")!;
    const tampered = token.slice(0, -1) + (token.endsWith("0") ? "1" : "0");
    expect(verifyPdfRenderToken("cv-1", tampered)).toBe(false);
  });

  it("issues nothing without a privileged key", () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    expect(createPdfRenderToken("cv-1")).toBeNull();
  });
});
