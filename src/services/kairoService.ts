import { GoogleGenerativeAI } from "@google/generative-ai";

interface Message {
  text: string;
  sender: "user" | "kairo";
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("Gemini API key is not configured");
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const KAIRO_SYSTEM_PROMPT = `You are Kairo, a friendly and helpful AI assistant for InstaLens - an AI-Powered Instagram Analytics & Content Intelligence Platform.

Your role is to help users:
- Understand how to use InstaLens features effectively
- Navigate the platform and find what they need
- Interpret their Instagram analytics and insights
- Get the most value from content analysis features
- Answer questions about Instagram strategy and best practices
- Troubleshoot any issues they might encounter

Key features of InstaLens you should know about:
- Profile Analytics: Engagement rates, follower growth, content performance
- Content Analysis: AI-powered insights on posts, reels, and stories
- Competitor Analysis: Benchmark against similar accounts
- Content Recommendations: Suggestions for optimal posting times and content types
- Performance Tracking: Historical data and trend analysis

Guidelines:
- Be friendly, professional, and concise
- Provide actionable advice and clear instructions
- Use simple language and avoid technical jargon
- If you don't know something specific about the app, be honest and suggest alternatives
- Keep responses brief but helpful (2-4 sentences typically)
- Encourage users to explore features and make data-driven decisions

Remember: You're here to make their Instagram analytics journey easier and more insightful!`;

export async function sendMessageToKairo(
  userMessage: string,
  conversationHistory: Message[]
): Promise<string> {
  if (!genAI) {
    return "I'm currently unavailable. Please make sure the Gemini API key is configured in your environment variables.";
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      systemInstruction: KAIRO_SYSTEM_PROMPT,
    });

    // Build conversation history for context
    const chatHistory = conversationHistory
      .slice(-6) // Keep last 6 messages for context
      .filter(
        (msg) =>
          msg.sender !== "kairo" || msg.text !== conversationHistory[0].text
      ) // Exclude initial greeting
      .map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error communicating with Kairo:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return "I'm having trouble connecting. Please check if the API key is configured correctly.";
      }
      if (error.message.includes("quota")) {
        return "I'm currently experiencing high traffic. Please try again in a moment.";
      }
    }

    return "I apologize, but I encountered an error. Please try rephrasing your question or try again later.";
  }
}
