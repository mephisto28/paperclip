import { describe, expect, it } from "vitest";
import { DEFAULT_CUSTOM_API, onboardingCustomApiInput, onboardingCustomApiModel } from "./onboarding-custom-api";

const draft = { ...DEFAULT_CUSTOM_API, baseUrl: "https://example.com/v1", model: "vendor/model" };

describe("onboarding custom API", () => {
  it.each(["", " ", "http://example.com", "https://user:password@example.com", "https://example.com?token=key", "https://example.com#fragment", "file:///etc/passwd"])("rejects invalid base URL %s", (baseUrl) => {
    expect(() => onboardingCustomApiInput({ ...draft, baseUrl }, "test-key")).toThrow();
  });

  it("requires a model and an authenticated endpoint's key", () => {
    expect(() => onboardingCustomApiInput({ ...draft, model: " " }, "test-key")).toThrow();
    expect(() => onboardingCustomApiInput(draft, " ")).toThrow();
  });

  it("accepts x-api-key only for Messages and strips key whitespace", () => {
    const input = onboardingCustomApiInput({ ...draft, protocol: "messages", auth: "api_key" }, " test-key ");
    expect(input.provider).toBe("anthropic");
    expect(input.apiKey).toBe("test-key");
    expect(() => onboardingCustomApiInput({ ...draft, auth: "api_key" }, "key")).toThrow();
  });

  it("omits a stale key when no authentication is selected", () => {
    expect(onboardingCustomApiInput({ ...draft, auth: "none" }, "ignored-key")).not.toHaveProperty("apiKey");
  });

  it("uses raw model IDs except for OpenCode's custom provider prefix", () => {
    expect(onboardingCustomApiModel(draft)).toBe("vendor/model");
    expect(onboardingCustomApiModel({ ...draft, protocol: "chat" })).toBe("paperclip/vendor/model");
    expect(onboardingCustomApiModel({ ...draft, protocol: "chat", model: "paperclip/model" })).toBe("paperclip/model");
  });
});
