DROP TABLE IF EXISTS chat_logs;
DROP TABLE IF EXISTS study_plans;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS mastery_scores;
DROP TABLE IF EXISTS performance_logs;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS students;

CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  learning_style TEXT NOT NULL,  -- Visual / Auditory / Reading
  grade TEXT NOT NULL,
  goal TEXT NOT NULL
);

CREATE TABLE topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE performance_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  topic_id INTEGER NOT NULL,
  score_percent INTEGER NOT NULL,
  attempted_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (topic_id) REFERENCES topics(id)
);

CREATE TABLE mastery_scores (
  student_id INTEGER NOT NULL,
  topic_id INTEGER NOT NULL,
  mastery_percent INTEGER NOT NULL,
  PRIMARY KEY (student_id, topic_id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (topic_id) REFERENCES topics(id)
);

CREATE TABLE resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,
  type TEXT NOT NULL,             -- video / article / exercise / pdf
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  learning_style_tag TEXT NOT NULL, -- Visual / Auditory / Reading
  duration_min INTEGER NOT NULL,
  FOREIGN KEY (topic_id) REFERENCES topics(id)
);

CREATE TABLE study_plans (
  student_id INTEGER PRIMARY KEY,
  plan_json TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE chat_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  topic_id INTEGER,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (topic_id) REFERENCES topics(id)
);