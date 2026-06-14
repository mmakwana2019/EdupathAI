import db from "./db";

const mastery = db.prepare(`
  SELECT s.name, t.name as topic, m.mastery_percent
  FROM mastery_scores m
  JOIN students s ON s.id = m.student_id
  JOIN topics t ON t.id = m.topic_id
  ORDER BY s.id, t.id
`).all();

console.table(mastery);