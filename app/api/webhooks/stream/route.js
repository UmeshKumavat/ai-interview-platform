import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  const body = await request.json();
  const eventType = body.type;

  console.log(`\n[stream-webhook] ← Received event: ${eventType}`);

  if (
    eventType !== "call.transcription_ready" &&
    eventType !== "call.recording_ready"
  ) {
    console.log(`[stream-webhook] Ignoring event type: ${eventType}`);
    return Response.json({ ok: true });
  }

  // call_cid arrives as "default:mock_123_abc" — we stored just "mock_123_abc"
  const callCid = body.call_cid ?? "";
  const streamCallId = callCid.includes(":") ? callCid.split(":")[1] : callCid;

  if (!streamCallId) {
    return Response.json({ ok: true });
  }

  try {
    const booking = await db.booking.findUnique({
      where: { streamCallId },
      include: {
        interviewer: {
          select: { id: true, clerkUserId: true, name: true, categories: true },
        },
        interviewee: {
          select: { id: true, clerkUserId: true, name: true },
        },
        feedback: { select: { id: true } },
      },
    });

    if (!booking) {
      return Response.json({ ok: true });
    }

    // ── Recording ready ───────────────────────────────────────────────────────
    if (eventType === "call.recording_ready") {
      const recordingUrl = body.call_recording?.url;

      if (!recordingUrl) {
        return Response.json({ ok: true });
      }

      await db.booking.update({
        where: { id: booking.id },
        // Backup: set status COMPLETED here too in case transcription fails
        data: { recordingUrl, status: "COMPLETED" },
      });

      return Response.json({ ok: true });
    }

    // ── Transcription ready ───────────────────────────────────────────────────
    if (eventType === "call.transcription_ready") {
      console.log(`[stream-webhook] ⚡ Processing transcription for booking ${booking.id}...`);

      // 1. Mark as COMPLETED immediately
      await db.booking.update({
        where: { id: booking.id },
        data: { status: "COMPLETED" },
      });

      // 2. Handle credit earning
      const earnExists = await db.creditTransaction.findFirst({
        where: { bookingId: booking.id, type: "BOOKING_EARNING" },
      });

      if (!earnExists) {
        console.log(`[stream-webhook] 💰 Allocating credits to interviewer...`);
        await db.creditTransaction.create({
          data: {
            userId: booking.interviewer.id,
            amount: booking.creditsCharged,
            type: "BOOKING_EARNING",
            bookingId: booking.id,
          },
        });
      }

      // 3. Process Transcription & AI Feedback
      const transcriptUrl = body.call_transcription?.url;
      if (!transcriptUrl) {
        console.log(`[stream-webhook] ⚠ No transcript URL found in payload.`);
        return Response.json({ ok: true });
      }

      if (booking.feedback) {
        console.log(`[stream-webhook] ℹ Feedback already exists, skipping AI analysis.`);
        return Response.json({ ok: true });
      }

      try {
        console.log(`[stream-webhook] 📥 Downloading transcript from: ${transcriptUrl}`);
        const transcriptRes = await fetch(transcriptUrl);
        const transcriptText = await transcriptRes.text();

        console.log(`[stream-webhook] 🔍 Parsing transcript lines...`);
        const lines = transcriptText
          .trim()
          .split("\n")
          .filter(Boolean)
          .map((line) => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          })
          .filter((entry) => entry?.text && entry?.speaker_id); // More inclusive filter

        console.log(`[stream-webhook] 📝 Found ${lines.length} speech segments.`);

        if (lines.length === 0) {
          console.log(`[stream-webhook] ∅ Transcript is empty, skipping AI analysis.`);
          return Response.json({ ok: true });
        }

      // Map clerkUserId to display name
        const speakerMap = {
          [booking.interviewer.clerkUserId]:
            booking.interviewer.name ?? "Interviewer",
          [booking.interviewee.clerkUserId]:
            booking.interviewee.name ?? "Interviewee",
        };

        const transcript = lines
          .map((l) => `${speakerMap[l.speaker_id] ?? l.speaker_id}: ${l.text}`)
          .join("\n");

      // 3. Generate feedback via Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        
        const model = genAI.getGenerativeModel(
          { model: "gemini-2.5-flash-lite" }
        );
        const categories =
          booking.interviewer.categories?.join(", ") ?? "General";

        const prompt = `You are an expert technical interviewer evaluating a mock interview.

Interview categories: ${categories}
Interviewer: ${booking.interviewer.name}
Candidate: ${booking.interviewee.name}

TRANSCRIPT:
${transcript}

Analyze the candidate's performance. Respond ONLY with a valid JSON object, no markdown, no backticks, no explanation:
{
  "summary": "2-3 sentence overall summary of the session",
  "technical": "Assessment of technical knowledge and accuracy",
  "communication": "Assessment of clarity, structure, and communication style",
  "problemSolving": "Assessment of problem-solving approach and thought process",
  "recommendation": "HIRE / CONSIDER / NO_HIRE with a one-sentence reason",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "overallRating": "POOR or AVERAGE or GOOD or EXCELLENT"
}`;

        const result = await model.generateContent(prompt);
        const raw = result.response
          .text()
          .trim()
          .replace(/^```json|^```|```$/gm, "")
          .trim();

        console.log(`[stream-webhook] ✅ AI analysis received. Parsing JSON...`);
        const feedbackData = JSON.parse(raw);

      // 4. Write to DB — upsert handles concurrent webhook retries cleanly (no P2002)

        await db.feedback.upsert({
          where: { bookingId: booking.id },
          create: {
            bookingId: booking.id,
            summary: feedbackData.summary,
            technical: feedbackData.technical,
            communication: feedbackData.communication,
            problemSolving: feedbackData.problemSolving,
            recommendation: feedbackData.recommendation,
            strengths: feedbackData.strengths,
            improvements: feedbackData.improvements,
            overallRating: feedbackData.overallRating,
          },
          update: {},
        });
        console.log(`[stream-webhook] ✨ Feedback successfully saved to database.`);
      } catch (aiError) {
        console.error("[stream-webhook] ✗ AI Analysis failed:", aiError.message);
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error(`[stream-webhook] ✗ Critical error during ${eventType}:`, error);
    return Response.json({ ok: true });
  }
}
