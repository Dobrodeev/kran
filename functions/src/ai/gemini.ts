import { GoogleGenAI } from "@google/genai";
import { config } from "../config";
import { toolDeclarations, executeTool, ToolContext } from "./tools";
import { ConversationMessage } from "../types";

const MODEL_NAME = "gemini-2.5-flash";
const MAX_TOOL_ITERATIONS = 5;

function buildSystemInstruction(catalogText: string): string {
  return [
    "Ти — консультант компанії KranUA (оренда автокранів у Києві).",
    "Спілкуйся тією мовою, якою пише клієнт (українська або російська).",
    "Допомагай з консультацією, бронюванням, перенесенням і оплатою оренди.",
    "Використовуй надані інструменти для перевірки доступності, створення/перенесення/скасування броні та оплати.",
    "Якщо потрібно послатись на \"поточну бронь\", але її ID невідомий з історії діалогу, викликай інструмент get_current_booking, щоб дізнатись останню бронь цього клієнта.",
    "Ніколи не вигадуй ціни чи техніку — використовуй лише дані з переліку нижче.",
    `Поточний час: ${new Date().toISOString()}.`,
    "Перелік техніки та цін:",
    catalogText,
  ].join("\n");
}

export async function runAgentTurn(params: {
  catalogText: string;
  history: ConversationMessage[];
  userMessage: string;
  ctx: ToolContext;
}): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

  const chat = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: buildSystemInstruction(params.catalogText),
      tools: [{ functionDeclarations: toolDeclarations }],
    },
    history: params.history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
  });

  let response = await chat.sendMessage({ message: params.userMessage });
  let iterations = 0;

  while (response.functionCalls && response.functionCalls.length > 0 && iterations < MAX_TOOL_ITERATIONS) {
    const calls = response.functionCalls;
    const settledResults = await Promise.allSettled(
      calls.map((call) => executeTool(call.name ?? "", (call.args ?? {}) as Record<string, unknown>, params.ctx))
    );
    // Use allSettled (not all) so that one failing tool call doesn't discard the
    // real results already computed for its sibling calls in the same turn, and
    // doesn't throw all the way up into the webhook handler.
    const responseParts = settledResults.map((settled, index) => {
      const call = calls[index];
      const response =
        settled.status === "fulfilled"
          ? settled.value
          : {
              error: "tool_execution_failed",
              reason: settled.reason instanceof Error ? settled.reason.message : String(settled.reason),
            };
      return {
        functionResponse: {
          id: call.id,
          name: call.name ?? "",
          response,
        },
      };
    });
    response = await chat.sendMessage({ message: responseParts });
    iterations += 1;
  }

  return response.text ?? "Вибачте, не вдалося сформувати відповідь. Напишіть /human, щоб покликати диспетчера.";
}
