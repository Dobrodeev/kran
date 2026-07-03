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
    const call = response.functionCalls[0];
    const result = await executeTool(call.name ?? "", (call.args ?? {}) as Record<string, unknown>, params.ctx);
    response = await chat.sendMessage({
      message: [{ functionResponse: { name: call.name ?? "", response: result } }],
    });
    iterations += 1;
  }

  return response.text ?? "Вибачте, не вдалося сформувати відповідь. Напишіть /human, щоб покликати диспетчера.";
}
