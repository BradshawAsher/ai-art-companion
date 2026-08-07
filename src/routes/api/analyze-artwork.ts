import { createFileRoute } from "@tanstack/react-router";

import {
  AI_DETECTION_PROMPT,
  FOLLOWUP_PROMPT,
  MASTERPIECE_STYLE_PROMPT,
  OUTPUT_FORMAT,
  SYSTEM_PROMPT_BASE,
  buildMediumPrompt,
  parseAnalysisResponse,
} from "@/lib/atelier-ai.server";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

/**
 * Ordered model chain. If a model is rate limited, errors, or truncates its answer
 * because it hit its token ceiling, we automatically escalate to the next, larger
 * model while sending the exact same conversation — so context is preserved.
 */
const TEXT_MODELS = [
  "google/gemini-3.1-flash-lite",
  "google/gemini-2.5-flash-lite",
  "google/gemini-3-flash-preview",
  "google/gemini-3.5-flash",
  "google/gemini-3.6-flash",
  "google/gemini-2.5-flash",
  "google/gemini-3.1-pro-preview",
  "google/gemini-2.5-pro",
];
const IMAGE_MODELS = ["google/gemini-3.1-flash-image", "google/gemini-3-pro-image"];


type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: unknown;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type GatewayResult =
  | { ok: true; data: any; model: string }
  | { ok: false; status: number; message: string };

async function callOnce(model: string, body: Record<string, unknown>): Promise<GatewayResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return { ok: false, status: 500, message: "AI is not configured on the server." };
  }

  let response: Response;
  try {
    response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
      body: JSON.stringify({ ...body, model }),
    });
  } catch (err) {
    console.error(`[analyze-artwork] network error calling ${model}`, err);
    return { ok: false, status: 503, message: "Could not reach the AI service." };
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(`[analyze-artwork] gateway error ${response.status} (${model}): ${text}`);
    if (response.status === 429) {
      return {
        ok: false,
        status: 429,
        message: "The analysis service is busy right now. Please wait a moment and try again.",
      };
    }
    if (response.status === 402) {
      return {
        ok: false,
        status: 402,
        message: "AI credits are exhausted. Please add credits to continue.",
      };
    }
    return { ok: false, status: 502, message: text.slice(0, 300) || "AI request failed." };
  }

  return { ok: true, data: await response.json(), model };
}

/**
 * Calls the gateway with retries and automatic model escalation.
 * `escalateOnLength` switches to a higher-capacity model when the reply was cut
 * off by the model's output token limit.
 */
async function callGateway(
  body: Record<string, unknown>,
  options: { models?: string[]; escalateOnLength?: boolean } = {},
): Promise<GatewayResult> {
  const models = options.models ?? TEXT_MODELS;
  let last: GatewayResult = { ok: false, status: 502, message: "AI request failed." };

  for (let i = 0; i < models.length; i++) {
    const model = models[i]!;
    for (let attempt = 0; attempt < 2; attempt++) {
      last = await callOnce(model, body);

      if (last.ok) {
        const finish = last.data?.choices?.[0]?.finish_reason;
        if (options.escalateOnLength && finish === "length" && i < models.length - 1) {
          console.warn(`[analyze-artwork] ${model} hit its token limit — escalating model.`);
          break; // escalate to next, larger model with identical context
        }
        return last;
      }

      // Credit exhaustion and configuration errors are terminal.
      if (last.status === 402 || last.status === 500) return last;

      // 429 → brief backoff then one retry on the same model before escalating.
      if (last.status === 429 && attempt === 0) {
        await new Promise((r) => setTimeout(r, 700));
        continue;
      }
      break;
    }
  }

  return last;
}

function imageMessage(imageBase64: string, mimeType: string | undefined, text: string) {
  return {
    role: "user" as const,
    content: [
      { type: "text", text },
      {
        type: "image_url",
        image_url: { url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}` },
      },
    ],
  };
}

function textOf(data: any): string {
  return typeof data?.choices?.[0]?.message?.content === "string"
    ? data.choices[0].message.content
    : "";
}

/** Strips a data-URL prefix if present so we can rebuild it consistently. */
function stripDataUrl(value: string): { base64: string; mimeType: string } {
  const match = /^data:([^;]+);base64,(.*)$/s.exec(value);
  if (match) return { mimeType: match[1]!, base64: match[2]! };
  return { mimeType: "image/png", base64: value };
}

async function handlePost({ request }: { request: Request }) {
  try {
    const body = (await request.json()) as Record<string, any>;

    // ---- Mode: Analyze style for masterpiece generation ----
    if (body.mode === "analyze-style") {
      if (!body.imageBase64) return json({ error: "No image provided" }, 400);
      const result = await callGateway({
        messages: [
          { role: "system", content: MASTERPIECE_STYLE_PROMPT },
          imageMessage(
            body.imageBase64,
            body.mimeType,
            "Describe the distinctive style of this artwork.",
          ),
        ],
      });
      if (!result.ok) return json({ error: result.message }, result.status);
      return json({
        styleDescription: textOf(result.data).trim() || "a beautiful artistic masterpiece",
      });
    }

    // ---- Mode: Generate Masterpiece ----
    if (body.mode === "generate-masterpiece") {
      const styleDescription = body.styleDescription || "a beautiful artistic masterpiece";
      const prompt = `Create a master-level artwork in the following style: ${styleDescription}. Make it breathtaking, gallery-worthy, and emotionally resonant. High quality, detailed.`;
      const result = await callGateway(
        {
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        },
        { models: IMAGE_MODELS },
      );
      if (!result.ok) return json({ error: result.message }, result.status);

      const imageUrl = result.data?.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? null;
      if (!imageUrl) return json({ error: "No image returned by the AI" }, 502);
      return json({ imageUrl, imageBase64: null, prompt });
    }

    // ---- Mode: Follow-up conversation ----
    if (body.mode === "followup") {
      const history: Array<{ role: string; content: string }> = body.history || [];
      const notes = typeof body.notes === "string" ? body.notes.trim() : "";
      const sketch = typeof body.sketchBase64 === "string" ? body.sketchBase64 : "";

      let context = `Previous feedback context:\n${body.previousFeedback || ""}`;
      if (notes) {
        context += `\n\nThe student's notepad currently reads:\n"""\n${notes.slice(0, 4000)}\n"""`;
      }
      context += `\n\nLet's discuss this further.`;

      const messages: ChatMessage[] = [
        { role: "system", content: FOLLOWUP_PROMPT },
        { role: "user", content: context },
      ];

      // Attach the artwork itself and the sketchpad drawing so the teacher can see them.
      if (body.artworkBase64) {
        messages.push(
          imageMessage(
            body.artworkBase64,
            body.artworkMimeType,
            "This is the artwork we are discussing.",
          ),
        );
      }
      if (sketch) {
        const { base64, mimeType } = stripDataUrl(sketch);
        messages.push(
          imageMessage(
            base64,
            mimeType,
            "This is the student's sketchpad drawing — reference it when they ask about it.",
          ),
        );
      }

      for (const msg of history) {
        messages.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        });
      }

      const result = await callGateway({ messages, max_tokens: 2000 }, { escalateOnLength: true });
      if (!result.ok) return json({ error: result.message }, result.status);
      const feedback = textOf(result.data).trim();
      if (!feedback) return json({ error: "No response received from the AI" }, 502);
      return json({ feedback, model: result.model });
    }

    // ---- Mode: Artwork analysis (default) ----
    const { imageBase64, mimeType, preferredMedium, profilePrompt, notes } = body;
    if (!imageBase64) return json({ error: "No image provided" }, 400);

    // Step 1: AI-generated art detection (admin/demo mode can skip it)
    const detection = body.skipAiDetection
      ? ({ ok: false, status: 0, message: "skipped" } as GatewayResult)
      : await callGateway({
          messages: [
            { role: "system", content: AI_DETECTION_PROMPT },
            imageMessage(
              imageBase64,
              mimeType,
              "Analyze this image and determine if it is AI-generated. Respond with only the JSON object.",
            ),
          ],
        });


    if (detection.ok) {
      const match = textOf(detection.data).match(/\{[\s\S]*?\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          // Only reject if there is high confidence AND concrete evidence
          if (parsed.aiGenerated === true && parsed.confidence === "high" && parsed.reason?.length > 10) {
            return json({ aiDetected: true, feedback: null });
          }
        } catch {
          /* proceed with analysis */
        }
      }
    }

    // Step 2: Main critique
    let systemPrompt = SYSTEM_PROMPT_BASE;
    if (preferredMedium && preferredMedium !== "none") {
      systemPrompt += buildMediumPrompt(preferredMedium);
    }
    if (profilePrompt && typeof profilePrompt === "string") {
      systemPrompt += `\n\n${profilePrompt}`;
    }
    if (typeof notes === "string" && notes.trim()) {
      systemPrompt += `\n\nThe student's notepad contains these notes — weave relevant points into your critique:\n"""\n${notes.trim().slice(0, 4000)}\n"""`;
    }
    systemPrompt += OUTPUT_FORMAT;

    const analysisMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      imageMessage(
        imageBase64,
        mimeType,
        "Please analyze my artwork and respond with only the JSON object.",
      ),
    ];

    let rawText = "";
    let usedModel = "";
    let parsed: ReturnType<typeof parseAnalysisResponse> = null;

    // The model occasionally returns malformed or truncated JSON — retry (and escalate) before giving up.
    for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
      const analysis = await callGateway(
        {
          messages: analysisMessages,
          response_format: { type: "json_object" },
          max_tokens: 4000,
        },
        { escalateOnLength: true, models: attempt === 0 ? TEXT_MODELS : TEXT_MODELS.slice(1) },
      );
      if (!analysis.ok) return json({ error: analysis.message }, analysis.status);

      rawText = textOf(analysis.data);
      usedModel = analysis.model;
      parsed = parseAnalysisResponse(rawText);

      if (!parsed) {
        console.error(
          `[analyze-artwork] parse failure (attempt ${attempt + 1}, model ${analysis.model}). finish_reason=${analysis.data?.choices?.[0]?.finish_reason} raw=${rawText.slice(0, 1000)}`,
        );
      }
    }

    if (!parsed) {
      // Last resort: salvage whatever prose the model produced so the student still gets feedback.
      const salvaged = rawText
        .replace(/```(?:json)?/gi, "")
        .replace(/^[\s\S]*?"critiqueText"\s*:\s*"/, "")
        .replace(/",?\s*"(?:skillLevel|critiquePins|mediumMatch|isAnalog|experimentationLevel)[\s\S]*$/, "")
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .trim();

      if (salvaged.length > 120) {
        return json({
          aiDetected: false,
          feedback: salvaged,
          skillLevel: "beginner",
          mediumMatch: false,
          isAnalog: false,
          experimentationLevel: "low",
          critiquePins: [],
        });
      }

      return json(
        { error: "The AI response could not be parsed. Please try uploading your artwork again." },
        502,
      );
    }

    return json({
      aiDetected: false,
      feedback: parsed.critiqueText,
      skillLevel: parsed.skillLevel,
      mediumMatch: parsed.mediumMatch,
      isAnalog: parsed.isAnalog,
      experimentationLevel: parsed.experimentationLevel,
      critiquePins: parsed.critiquePins,
      model: usedModel,
    });

  } catch (err) {
    console.error("[analyze-artwork] unexpected error", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
}

export const Route = createFileRoute("/api/analyze-artwork")({
  server: {
    handlers: {
      POST: handlePost,
    },
  },
});
