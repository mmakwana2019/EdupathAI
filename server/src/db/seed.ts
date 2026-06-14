import db, { initSchema } from "./db";

initSchema();

// ---------- STUDENTS ----------
const insertStudent = db.prepare(
  `INSERT INTO students (name, learning_style, grade, goal) VALUES (?, ?, ?, ?)`
);

insertStudent.run("Aanya Sharma", "Visual", "Grade 10", "Score 95+ in Board Exams");
insertStudent.run("Rohan Mehta", "Auditory", "Grade 10", "Improve overall math score");
insertStudent.run("Priya Iyer", "Reading", "Grade 10", "Build consistent study habits");

// ---------- TOPICS ----------
const insertTopic = db.prepare(`INSERT INTO topics (subject, name) VALUES (?, ?)`);

insertTopic.run("Math", "Algebra");
insertTopic.run("Math", "Geometry");
insertTopic.run("Math", "Trigonometry");
insertTopic.run("Science", "Physics Basics");

// Topic IDs: 1=Algebra, 2=Geometry, 3=Trigonometry, 4=Physics Basics
// Student IDs: 1=Aanya, 2=Rohan, 3=Priya

// ---------- PERFORMANCE LOGS ----------
const insertLog = db.prepare(
  `INSERT INTO performance_logs (student_id, topic_id, score_percent, attempted_at) VALUES (?, ?, ?, ?)`
);

const today = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

// Aanya (Visual) - strong overall
insertLog.run(1, 1, 92, today(10));
insertLog.run(1, 1, 88, today(7));
insertLog.run(1, 2, 85, today(9));
insertLog.run(1, 2, 90, today(5));
insertLog.run(1, 3, 78, today(6));
insertLog.run(1, 3, 82, today(2));
insertLog.run(1, 4, 95, today(3));

// Rohan (Auditory) - strong in Algebra/Geometry, weak in Trig & Physics
insertLog.run(2, 1, 80, today(10));
insertLog.run(2, 1, 85, today(6));
insertLog.run(2, 2, 75, today(8));
insertLog.run(2, 2, 70, today(4));
insertLog.run(2, 3, 45, today(9));
insertLog.run(2, 3, 38, today(3));
insertLog.run(2, 4, 50, today(5));
insertLog.run(2, 4, 42, today(1));

// Priya (Reading) - balanced/average across topics
insertLog.run(3, 1, 65, today(10));
insertLog.run(3, 1, 70, today(5));
insertLog.run(3, 2, 68, today(8));
insertLog.run(3, 2, 72, today(4));
insertLog.run(3, 3, 60, today(7));
insertLog.run(3, 3, 64, today(2));
insertLog.run(3, 4, 66, today(3));

// ---------- MASTERY SCORES (avg of logs per student/topic) ----------
const allCombos = db
  .prepare(
    `SELECT student_id, topic_id, AVG(score_percent) as avg_score
     FROM performance_logs GROUP BY student_id, topic_id`
  )
  .all() as { student_id: number; topic_id: number; avg_score: number }[];

const insertMastery = db.prepare(
  `INSERT INTO mastery_scores (student_id, topic_id, mastery_percent) VALUES (?, ?, ?)`
);

for (const row of allCombos) {
  insertMastery.run(row.student_id, row.topic_id, Math.round(row.avg_score));
}

// ---------- RESOURCES ----------
const insertResource = db.prepare(
  `INSERT INTO resources (topic_id, type, title, url, learning_style_tag, duration_min) VALUES (?, ?, ?, ?, ?, ?)`
);

// Algebra (topic 1)
insertResource.run(1, "video", "Algebra Basics Explained Visually", "https://example.com/algebra-video", "Visual", 12);
insertResource.run(1, "article", "Understanding Algebraic Expressions", "https://example.com/algebra-article", "Reading", 8);
insertResource.run(1, "exercise", "Algebra Practice Set 1", "https://example.com/algebra-exercise", "Auditory", 15);
insertResource.run(1, "pdf", "Algebra Formula Sheet", "https://example.com/algebra-pdf", "Reading", 5);

// Geometry (topic 2)
insertResource.run(2, "video", "Geometry Shapes & Theorems Visualized", "https://example.com/geometry-video", "Visual", 14);
insertResource.run(2, "article", "Geometry Theorems Explained", "https://example.com/geometry-article", "Reading", 10);
insertResource.run(2, "exercise", "Geometry Practice Problems", "https://example.com/geometry-exercise", "Auditory", 18);
insertResource.run(2, "pdf", "Geometry Quick Reference", "https://example.com/geometry-pdf", "Reading", 6);

// Trigonometry (topic 3)
insertResource.run(3, "video", "Trigonometry Made Simple - Visual Guide", "https://example.com/trig-video", "Visual", 16);
insertResource.run(3, "article", "Trig Identities Explained Step-by-Step", "https://example.com/trig-article", "Reading", 9);
insertResource.run(3, "exercise", "Trigonometry Audio Walkthrough", "https://example.com/trig-audio", "Auditory", 20);
insertResource.run(3, "pdf", "Trig Formula Cheat Sheet", "https://example.com/trig-pdf", "Reading", 5);

// Physics Basics (topic 4)
insertResource.run(4, "video", "Physics Concepts Animated", "https://example.com/physics-video", "Visual", 15);
insertResource.run(4, "article", "Newton's Laws Explained", "https://example.com/physics-article", "Reading", 10);
insertResource.run(4, "exercise", "Physics Numericals Practice", "https://example.com/physics-exercise", "Auditory", 17);
insertResource.run(4, "pdf", "Physics Formula Sheet", "https://example.com/physics-pdf", "Reading", 6);

console.log("✅ Seed data inserted successfully!");
console.log("Students: Aanya Sharma (Visual), Rohan Mehta (Auditory), Priya Iyer (Reading)");
console.log("Topics: Algebra, Geometry, Trigonometry, Physics Basics");