import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import studentsRouter from "./routes/students";
import planRouter from "./routes/plan";
import chatRouter from "./routes/chat";
import resourcesRouter from "./routes/resources";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "EduPath server running" });
});

app.use("/api", studentsRouter);
app.use("/api", planRouter);
app.use("/api", chatRouter);
app.use("/api", resourcesRouter);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});