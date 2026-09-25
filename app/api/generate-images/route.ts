import { NextRequest, NextResponse } from "next/server";
import dns from "node:dns";
import { GoogleGenAI } from "@google/genai";
import { ProviderKey } from "@/lib/provider-config";
import { GenerateImageRequest } from "@/lib/api-types";

dns.setDefaultResultOrder("ipv4first");

/**
 * Intended to be slightly less than the maximum execution time allowed by the
 * runtime so that we can gracefully terminate our request.
 */
const TIMEOUT_MILLIS = 55 * 1000;

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

function getGeminiApiKey(): string | undefined {
  const key =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY;
  if (typeof key !== "string") return undefined;
  const trimmed = key.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function clientErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "Request timed out") {
    return "Request timed out. Try a faster model or a simpler prompt.";
  }

  if (error && typeof error === "object") {
    const err = error as {
      status?: number;
      statusCode?: number;
      message?: string;
      error?: { code?: number; status?: string; message?: string };
    };
    const status = err.status ?? err.statusCode ?? err.error?.code;
    const message = err.error?.message || err.message || "";

    if (status === 400 && /API key|api.?key|INVALID_ARGUMENT/i.test(message)) {
      return "Invalid Gemini API key. Check GEMINI_API_KEY in .env.local.";
    }
    if (status === 401 || status === 403) {
      return "Invalid Gemini API key. Check GEMINI_API_KEY in .env.local.";
    }
    if (status === 404) {
      return "This Gemini model was not found. Pick a different model.";
    }
    if (status === 429) {
      return "Gemini rate limit reached. Wait a moment and try again.";
    }
    if (/fetch failed|ECONNRESET|ENOTFOUND|ETIMEDOUT|SSL_ERROR|socket disconnected/i.test(message)) {
      return "Cannot reach Gemini API from this environment. Check network access to generativelanguage.googleapis.com.";
    }
    if (/SAFETY|blocked|IMAGE_SAFETY/i.test(message)) {
      return "Gemini blocked this prompt. Try a different description.";
    }
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Failed to generate image. Please try again later.";
}

const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMillis: number,
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeoutMillis),
    ),
  ]);
};

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  let prompt: string | undefined;
  let provider: ProviderKey | undefined;
  let modelId: string | undefined;

  try {
    const body = (await req.json()) as GenerateImageRequest;
    prompt = body.prompt;
    provider = body.provider;
    modelId = body.modelId;

    if (!prompt || !provider || !modelId || provider !== "gemini") {
      const error = "Invalid request parameters";
      console.error(`${error} [requestId=${requestId}]`);
      return NextResponse.json({ error }, { status: 400 });
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      const error =
        "Missing Gemini API key. Set GEMINI_API_KEY in .env.local.";
      console.error(`${error} [requestId=${requestId}]`);
      return NextResponse.json({ error }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    console.log(provider, modelId);

    const startstamp = performance.now();
    const generatePromise = (async () => {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      const blockReason =
        response.promptFeedback?.blockReason ||
        response.candidates?.[0]?.finishReason;
      if (
        blockReason &&
        /SAFETY|BLOCK|IMAGE_SAFETY|PROHIBITED/i.test(String(blockReason))
      ) {
        throw new Error(
          "Gemini blocked this prompt. Try a different description.",
        );
      }

      const imageFromParts = response.candidates?.[0]?.content?.parts?.find(
        (part) => part.inlineData?.data,
      )?.inlineData?.data;
      const image = imageFromParts || response.data;

      if (!image) {
        const text = response.text?.trim();
        throw new Error(text || "Gemini returned no image for this prompt.");
      }

      console.log(
        `Completed image request [requestId=${requestId}, provider=${provider}, model=${modelId}, elapsed=${(
          (performance.now() - startstamp) /
          1000
        ).toFixed(1)}s].`,
      );

      return {
        provider,
        image,
      };
    })();

    const result = await withTimeout(generatePromise, TIMEOUT_MILLIS);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(
      `Error generating image [requestId=${requestId}, provider=${provider}, model=${modelId}]: `,
      error,
    );
    return NextResponse.json(
      { error: clientErrorMessage(error) },
      { status: 500 },
    );
  }
}
