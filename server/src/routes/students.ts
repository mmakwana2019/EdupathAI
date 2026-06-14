import { Router } from "express";
import db from "../db/db";

const router = Router();

// GET /api/students - list all demo students
router.get("/students", (req, res) => {
  const students = db.prepare(`SELECT id, name, learning_style, grade, goal FROM students`).all();
  res.json(students);
});

// GET /api/student/:id/dashboard - mastery scores, gaps, cached plan
router.get("/student/:id/dashboard", (req, res) => {
  const studentId = req.params.id;

  const student = db.prepare(`SELECT * FROM students WHERE id = ?`).get(studentId);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const mastery = db.prepare(`
    SELECT t.id as topic_id, t.subject, t.name as topic_name, m.mastery_percent
    FROM mastery_scores m
    JOIN topics t ON t.id = m.topic_id
    WHERE m.student_id = ?
    ORDER BY t.id
  `).all(studentId);

  // Determine gap level for heatmap coloring
  const gaps = mastery.map((m: any) => ({
    ...m,
    gap_level:
      m.mastery_percent < 50 ? "high" :
      m.mastery_percent < 70 ? "medium" : "low",
  }));

  const planRow = db.prepare(`SELECT plan_json, generated_at FROM study_plans WHERE student_id = ?`).get(studentId) as any;
  const plan = planRow ? JSON.parse(planRow.plan_json) : null;

  res.json({
    student,
    mastery: gaps,
    plan,
  });
});

export default router;