import { Router } from "express";
import db from "../db/db";
import { chatCompletion } from "../services/ai/foundryClient";
import { buildStudyPlanPrompt } from "../services/ai/prompts";

const router = Router();

// Hardcoded fallback plan in case Foundry call fails
function getFallbackPlan() {
  return {
    plan: [
      { day: "Day 1", topic: "Trigonometry", task: "Watch the visual guide and note down all basic identities", duration_min: 16, resource_title: "Trigonometry Made Simple - Visual Guide", resource_url: "https://example.com/trig-video", reason: "Builds foundational visual understanding before practice" },
      { day: "Day 2", topic: "Trigonometry", task: "Complete the audio walkthrough practice problems", duration_min: 20, resource_title: "Trigonometry Audio Walkthrough", resource_url: "https://example.com/trig-audio", reason: "Reinforces concepts through guided practice" },
      { day: "Day 3", topic: "Physics Basics", task: "Watch animated concepts video and summarize key laws", duration_min: 15, resource_title: "Physics Concepts Animated", resource_url: "https://example.com/physics-video", reason: "Visual format aids retention of abstract concepts" },
      { day: "Day 4", topic: "Physics Basics", task: "Attempt numerical practice problems", duration_min: 17, resource_title: "Physics Numericals Practice", resource_url: "https://example.com/physics-exercise", reason: "Practice solidifies problem-solving speed" },
      { day: "Day 5", topic: "Trigonometry", task: "Review formula sheet and attempt a quick self-test", duration_min: 10, resource_title: "Trig Formula Cheat Sheet", resource_url: "https://example.com/trig-pdf", reason: "Quick revision before moving forward" },
    ],
  };
}

router.post("/student/:id/generate-plan", async (req, res) => {
  const studentId = req.params.id;

  try {
    const student = db.prepare(`SELECT * FROM students WHERE id = ?`).get(studentId) as any;
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Get weak topics (mastery < 70)
    const weakMastery = db.prepare(`
      SELECT t.id as topic_id, t.name as topic_name, m.mastery_percent
      FROM mastery_scores m
      JOIN topics t ON t.id = m.topic_id
      WHERE m.student_id = ? AND m.mastery_percent < 70
      ORDER BY m.mastery_percent ASC
    `).all(studentId) as any[];

    // If no weak topics, fall back to lowest 2 topics
    let targetTopics = weakMastery;
    if (targetTopics.length === 0) {
      targetTopics = db.prepare(`
        SELECT t.id as topic_id, t.name as topic_name, m.mastery_percent
        FROM mastery_scores m
        JOIN topics t ON t.id = m.topic_id
        WHERE m.student_id = ?
        ORDER BY m.mastery_percent ASC
        LIMIT 2
      `).all(studentId) as any[];
    }

    // Attach 2-3 resources per topic
    const weakTopicsWithResources = targetTopics.map((t) => {
      const resources = db.prepare(`
        SELECT title, type, url, duration_min FROM resources WHERE topic_id = ? LIMIT 3
      `).all(t.topic_id) as any[];
      return { ...t, resources };
    });

    const { system, user } = buildStudyPlanPrompt(student.name, student.learning_style, weakTopicsWithResources);

    let planJson;
    try {
      const raw = await chatCompletion(system, user, true);
      planJson = JSON.parse(raw);
    } catch (aiError) {
      console.error("Foundry call failed, using fallback plan:", aiError);
      planJson = getFallbackPlan();
    }

    // Cache the plan
    db.prepare(`
      INSERT INTO study_plans (student_id, plan_json, generated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(student_id) DO UPDATE SET plan_json = ?, generated_at = ?
    `).run(studentId, JSON.stringify(planJson), new Date().toISOString(), JSON.stringify(planJson), new Date().toISOString());

    res.json({ plan: planJson });
  } catch (err) {
    console.error("generate-plan error:", err);
    res.status(500).json({ error: "Failed to generate plan" });
  }
});

export default router;