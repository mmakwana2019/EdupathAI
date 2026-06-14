const BASE_URL = "http://localhost:3001/api";

export interface Student {
  id: number;
  name: string;
  learning_style: string;
  grade: string;
  goal: string;
}

export interface MasteryItem {
  topic_id: number;
  subject: string;
  topic_name: string;
  mastery_percent: number;
  gap_level: "low" | "medium" | "high";
}

export interface DashboardData {
  student: Student;
  mastery: MasteryItem[];
  plan: any;
}

export async function getStudents(): Promise<Student[]> {
  const res = await fetch(`${BASE_URL}/students`);
  return res.json();
}

export async function getDashboard(studentId: number): Promise<DashboardData> {
  const res = await fetch(`${BASE_URL}/student/${studentId}/dashboard`);
  return res.json();
}

export async function generatePlan(studentId: number): Promise<{ plan: any }> {
  const res = await fetch(`${BASE_URL}/student/${studentId}/generate-plan`, {
    method: "POST",
  });
  return res.json();
}

export async function askDoubt(studentId: number, topicId: number | null, question: string): Promise<{ answer: string }> {
  const res = await fetch(`${BASE_URL}/chat/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id: studentId, topic_id: topicId, question }),
  });
  return res.json();
}

export interface Resource {
  id: number;
  topic_id: number;
  topic_name: string;
  type: string;
  title: string;
  url: string;
  learning_style_tag: string;
  duration_min: number;
}

export async function getResources(topicId: number, learningStyle?: string): Promise<Resource[]> {
  const params = new URLSearchParams({ topic_id: String(topicId) });
  if (learningStyle) params.append("learning_style", learningStyle);
  const res = await fetch(`${BASE_URL}/resources?${params.toString()}`);
  return res.json();
}