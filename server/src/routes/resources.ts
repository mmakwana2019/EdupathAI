import { Router } from "express";
import db from "../db/db";

const router = Router();

// GET /api/resources?topic_id=X&learning_style=Y
router.get("/resources", (req, res) => {
  const { topic_id, learning_style } = req.query;

  let query = `SELECT r.*, t.name as topic_name FROM resources r JOIN topics t ON t.id = r.topic_id WHERE 1=1`;
  const params: any[] = [];

  if (topic_id) {
    query += ` AND r.topic_id = ?`;
    params.push(topic_id);
  }

  if (learning_style) {
    query += ` AND r.learning_style_tag = ?`;
    params.push(learning_style);
  }

  query += ` ORDER BY r.topic_id`;

  const resources = db.prepare(query).all(...params);
  res.json(resources);
});

export default router;