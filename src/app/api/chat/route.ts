import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.LLM_API_KEY || "",
  baseURL: process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1", // Default to Groq
});

export async function POST(request: NextRequest) {
  try {
    const { messages, ledgerData } = await request.json();

    if (!process.env.LLM_API_KEY) {
      return NextResponse.json(
        { error: "LLM_API_KEY (Groq/OpenRouter key) is not configured" },
        { status: 500 }
      );
    }

    // Prepare context from ledger data
    const dataContext = ledgerData
      .slice(0, 30)
      .map((a: any) => `${a.name} (${a.symbol}): $${a.value}, 24h: ${a.change}%, Vol: ${a.volume}`)
      .join("\n");

    const systemPrompt = `
      You are the "Asset Ledger Copilot", a specialized financial AI.
      You analyze the following Global Asset Ledger data in real-time:
      
      --- CURRENT DATA (Top 30 Assets) ---
      ${dataContext}
      ---
      
      Your Goal:
      1. Answer user questions about the assets listed above.
      2. Provide insights on market trends (gainers, losers, volume spikes).
      3. Help with educational queries about the regions (AMER, APAC, EMEA, Global).
      
      Tone: Professional, helpful, and data-driven.
      Formatting: Use Markdown. Use **bold** for asset names and numbers. Use bullet points or numbered lists when listing multiple items. Keep paragraphs short.
      Constraints: If asked about an asset NOT in the data, mention you don't have its real-time data but can discuss general knowledge.
    `;

    // Map history to OpenAI format
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === "model" ? "assistant" : m.role,
        content: m.content,
      })),
    ];

    const response = await openai.chat.completions.create({
      model: process.env.LLM_MODEL || "llama-3.3-70b-versatile", // High performance Llama 3
      messages: formattedMessages as any,
      max_tokens: 500,
      temperature: 0.2, // Lower temperature for more accurate data analysis
    });

    return NextResponse.json({ content: response.choices[0].message.content });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response", message: error.message },
      { status: 500 }
    );
  }
}
