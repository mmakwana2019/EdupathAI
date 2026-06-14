import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(__dirname, "edupath.db");
const db = new Database(dbPath);

export function initSchema() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  db.exec(schema);
}

export default db;