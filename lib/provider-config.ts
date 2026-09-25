export type ProviderKey = "gemini";
export type ModelMode = "performance" | "quality";

export const PROVIDERS: Record<
  ProviderKey,
  {
    displayName: string;
    iconPath: string;
    color: string;
    models: string[];
  }
> = {
  gemini: {
    displayName: "Gemini",
    iconPath: "/provider-icons/gemini.svg",
    color: "from-blue-500 to-purple-500",
    models: [
      "gemini-2.5-flash-image",
      "gemini-3.1-flash-lite-image",
      "gemini-3.1-flash-image",
      "gemini-3-pro-image",
    ],
  },
};

export const MODEL_CONFIGS: Record<ModelMode, Record<ProviderKey, string>> = {
  performance: {
    gemini: "gemini-2.5-flash-image",
  },
  quality: {
    gemini: "gemini-3-pro-image",
  },
};

export const PROVIDER_ORDER: ProviderKey[] = ["gemini"];

export const initializeProviderRecord = <T>(defaultValue?: T) =>
  Object.fromEntries(
    PROVIDER_ORDER.map((key) => [key, defaultValue]),
  ) as Record<ProviderKey, T>;
