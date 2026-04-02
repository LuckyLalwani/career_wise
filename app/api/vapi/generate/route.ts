"use server";

import { generateObject } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

// ==============================
// ✅ SCHEMA (STRICT STRUCTURE)
// ==============================
const questionSchema = z.object({
  questions: z.array(z.string().min(5)),
});

// ==============================
// 🚀 POST: CREATE INTERVIEW
// ==============================
export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("📥 Incoming body:", body);

    const { type, role, level, techstack, amount, userid } = body;

    // ==============================
    // ✅ VALIDATION (VERY IMPORTANT)
    // ==============================
    if (!role || !level || !techstack || !amount || !userid) {
      throw new Error("Missing required fields");
    }

    // ==============================
    // 🚀 AI GENERATION (OpenRouter)
    // ==============================
    const { object } = await generateObject({
      model: openrouter("openai/gpt-4o-mini"),

      schema: questionSchema,

      system:
        "You are an expert interviewer generating high-quality, voice-friendly interview questions.",

      prompt: `
Generate interview questions based on:

Role: ${role}
Experience Level: ${level}
Tech Stack: ${techstack}
Focus: ${type}
Number of Questions: ${amount}

STRICT RULES:
- Output ONLY valid JSON
- No explanations
- No markdown
- No special characters like / * etc.
- Keep questions clear and concise
- Make them realistic interview questions
`,
      temperature: 0.7,
    });

    // ==============================
    // 📦 PREPARE DATA
    // ==============================
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map((t: string) => t.trim()),
      questions: object.questions,
      userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    console.log("📦 Saving interview:", interview);

    // ==============================
    // 💾 SAVE TO FIRESTORE
    // ==============================
    await db.collection("interviews").add(interview);

    return Response.json(
      { success: true, data: interview },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("🔥 ERROR:", error.message);
    console.error(error.stack);

    return Response.json(
      {
        success: false,
        error: error.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}

// ==============================
// ✅ GET: HEALTH CHECK
// ==============================
export async function GET() {
  return Response.json(
    {
      success: true,
      message: "Interview API is working 🚀",
    },
    { status: 200 }
  );
}