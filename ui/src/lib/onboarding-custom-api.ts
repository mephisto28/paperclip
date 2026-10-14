import { aiProviderRoutingSchema, aiRoutingModel, createAiConnectionSchema } from "@paperclipai/shared";

export const CUSTOM_API_ADAPTERS = {
  responses: "codex_local",
  messages: "claude_local",
  chat: "opencode_local",
} as const;

export type OnboardingCustomApi = {
  protocol: keyof typeof CUSTOM_API_ADAPTERS;
  baseUrl: string;
  model: string;
  auth: "bearer" | "api_key" | "none";
};

export const DEFAULT_CUSTOM_API: OnboardingCustomApi = {
  protocol: "responses", baseUrl: "", model: "", auth: "bearer",
};

export function onboardingCustomApiInput(value: OnboardingCustomApi, apiKey: string) {
  const routing = aiProviderRoutingSchema.safeParse({
    kind: "gateway", protocol: value.protocol, baseUrl: value.baseUrl,
    auth: value.auth, models: [{ id: value.model }],
  });
  if (!routing.success) throw new Error(routing.error.issues[0].message);
  const input = createAiConnectionSchema.safeParse({
    provider: value.protocol === "messages" ? "anthropic" : "openai",
    method: "api_key", name: "My custom API", ownership: "personal",
    agentIds: [], allAgents: true, routing: routing.data,
    ...(value.auth !== "none" ? { apiKey: apiKey.trim() } : {}),
  });
  if (!input.success) throw new Error(input.error.issues[0].message);
  return input.data;
}

export function onboardingCustomApiModel(value: OnboardingCustomApi) {
  return aiRoutingModel(
    { kind: "gateway", protocol: value.protocol, auth: value.auth, models: [] },
    CUSTOM_API_ADAPTERS[value.protocol], value.model.trim(),
  );
}
