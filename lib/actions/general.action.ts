"use server";

import { generateObject } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

// 🔥 Make sure this is set in your .env
// OPENROUTER_API_KEY=your_key_here

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    // ✅ Format transcript nicely
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    // 🚀 OpenRouter + generateObject
    const { object } = await generateObject({
      model: openrouter("openai/gpt-4o-mini"), // 🔥 best balance of cost + accuracy
      schema: feedbackSchema,

      system:
        "You are a professional interviewer analyzing a mock interview. Be strict, analytical, and detailed.",

      prompt: `
You are an AI interviewer analyzing a mock interview.

Your task:
- Evaluate the candidate strictly
- Do NOT be lenient
- Identify real weaknesses

Transcript:
${formattedTranscript}

Return structured evaluation based ONLY on these categories:

1. Communication Skills
2. Technical Knowledge
3. Problem-Solving
4. Cultural & Role Fit
5. Confidence & Clarity

Also provide:
- strengths (array)
- areasForImprovement (array)
- finalAssessment (string)
- totalScore (0–100)

IMPORTANT:
- Be honest and critical
- Do not inflate scores
`,
    });

    // ✅ Prepare feedback object
    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    // ✅ Save to Firestore
    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("❌ Error saving feedback:", error);
    return { success: false };
  }
}

// ==============================
// 🔍 GET INTERVIEW BY ID
// ==============================
export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();
  return interview.data() as Interview | null;
}

// ==============================
// 📊 GET FEEDBACK
// ==============================
export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

// ==============================
// 🆕 GET LATEST INTERVIEWS
// ==============================
export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

// ==============================
// 👤 GET USER INTERVIEWS
// ==============================
export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}