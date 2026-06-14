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