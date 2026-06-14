import { Router } from "express";
import db from "../db/db";
import { chatCompletion } from "../services/ai/foundryClient";
import { buildChatPrompt } from "../services/ai/prompts";

const router = Router();

const FALLBACK_RESPONSE = "That's a great question! While I'm having trouble connecting right now, here's a tip: try breaking the problem into smaller steps and reviewing the relevant formula sheet in your resources. Feel free to ask again in a moment!";

router.post("/chat/ask", async (req, res) => {
  const { student_id, topic_id, question } = req.body;

  if (!student_id || !question) {
    return res.status(400).json({ error: "student_id and question are required" });
  }

  try {
    const student = db.prepare(`SELECT * FROM students WHERE id = ?`).get(student_id) as any;
    if (!student) return res.status(404).json({ error: "Student not found" });

    let topicName: string | null = null;
    if (topic_id) {
      const topic = db.prepare(`SELECT name FROM topics WHERE id = ?`).get(topic_id) as any;
      topicName = topic ? topic.name : null;
    }

    const { system } = buildChatPrompt(student.name, student.learning_style, student.grade, topicName);

    let answer;
    try {
      answer = await chatCompletion(system, question, false);
    } catch (aiError) {
      console.error("Foundry chat call failed, using fallback:", aiError);
      answer = FALLBACK_RESPONSE;
    }

    // Log the interaction
    db.prepare(`
      INSERT INTO chat_logs (student_id, topic_id, question, answer, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(student_id, topic_id || null, question, answer, new Date().toISOString());

    res.json({ answer });
  } catch (err) {
    console.error("chat/ask error:", err);
    res.status(500).json({ error: "Failed to process question" });
  }
});

export default router;