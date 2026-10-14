import { aiProviderRoutingSchema } from "@paperclipai/shared";
import { CUSTOM_API_ADAPTERS, type OnboardingCustomApi } from "../../lib/onboarding-custom-api";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function OnboardingCustomApiFields({ value, onChange, apiKey, onApiKeyChange, disabled, disabledAdapters }: {
  value: OnboardingCustomApi;
  onChange: (value: OnboardingCustomApi) => void;
  apiKey: string;
  onApiKeyChange: (value: string) => void;
  disabled: boolean;
  disabledAdapters: ReadonlySet<string>;
}) {
  const urlCheck = aiProviderRoutingSchema.safeParse({
    kind: "gateway", protocol: value.protocol, auth: value.auth, baseUrl: value.baseUrl,
  });
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="onboarding-api-format">API format</Label>
        <Select value={value.protocol} disabled={disabled} onValueChange={(protocol: OnboardingCustomApi["protocol"]) => onChange({ ...value, protocol, auth: value.auth === "api_key" && protocol !== "messages" ? "bearer" : value.auth })}>
          <SelectTrigger id="onboarding-api-format" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="responses" disabled={disabledAdapters.has(CUSTOM_API_ADAPTERS.responses)}>OpenAI Responses · Codex</SelectItem>
            <SelectItem value="messages" disabled={disabledAdapters.has(CUSTOM_API_ADAPTERS.messages)}>Anthropic Messages · Claude</SelectItem>
            <SelectItem value="chat" disabled={disabledAdapters.has(CUSTOM_API_ADAPTERS.chat)}>Chat Completions · OpenCode</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="onboarding-api-url">Base URL</Label>
        <Input id="onboarding-api-url" type="url" autoFocus autoComplete="off" placeholder="https://gateway.example.com/v1" value={value.baseUrl} onChange={(e) => onChange({ ...value, baseUrl: e.target.value })} aria-describedby="onboarding-api-url-help" aria-invalid={Boolean(value.baseUrl && !urlCheck.success)} />
        <p id="onboarding-api-url-help" className="text-xs text-muted-foreground">
          {value.baseUrl && !urlCheck.success ? urlCheck.error.issues[0].message : "Use the provider's base URL, not a /chat/completions or /responses endpoint. Localhost refers to the agent's execution environment."}
        </p>
      </div>
      <div className="space-y-1">
        <Label htmlFor="onboarding-api-auth">Authentication</Label>
        <Select value={value.auth} disabled={disabled} onValueChange={(auth: OnboardingCustomApi["auth"]) => onChange({ ...value, auth })}>
          <SelectTrigger id="onboarding-api-auth" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="bearer">Bearer API key</SelectItem>
            {value.protocol === "messages" && <SelectItem value="api_key">x-api-key header</SelectItem>}
            <SelectItem value="none">No authentication</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {value.auth !== "none" && <div className="space-y-1">
        <Label htmlFor="onboarding-custom-api-key">API key</Label>
        <Input id="onboarding-custom-api-key" type="password" autoComplete="off" placeholder="Enter API key" value={apiKey} onChange={(e) => onApiKeyChange(e.target.value)} />
      </div>}
      <div className="space-y-1">
        <Label htmlFor="onboarding-api-model">Model ID</Label>
        <Input id="onboarding-api-model" placeholder="Exact model ID from your provider" value={value.model} onChange={(e) => onChange({ ...value, model: e.target.value })} />
      </div>
      <p className="text-xs text-muted-foreground">Connect saves this connection and tests it in the agent's execution environment before creating the agent.</p>
    </fieldset>
  );
}
