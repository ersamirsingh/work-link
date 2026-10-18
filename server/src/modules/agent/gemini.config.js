import dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// gemini-1.5-flash is discontinued on v1beta API in 2026. Use gemini-2.5-flash or gemini-flash-latest
let modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
if (modelName === "gemini-1.5-flash" || modelName.includes("1.5")) {
  modelName = "gemini-2.5-flash";
}

// text-embedding-004 is retired; use gemini-embedding-001
let embeddingModelName = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
if (embeddingModelName === "text-embedding-004") {
  embeddingModelName = "gemini-embedding-001";
}

if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment variables. Agent features will fail.");
}

export const model = new ChatGoogleGenerativeAI({
  apiKey: apiKey || "DUMMY_KEY",
  model: modelName,
  temperature: 0.2,
});

export const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: apiKey || "DUMMY_KEY",
  model: embeddingModelName,
});

