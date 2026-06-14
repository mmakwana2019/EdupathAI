import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents } from "../api";
import type { Student } from "../api";

export default function Landing() {
  const [students, setStudents] = useState<Student[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getStudents().then(setStudents);
  }, []);

  const selectStudent = (id: number) => {
    localStorage.setItem("studentId", String(id));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-indigo-600 mb-1">EduPath</h1>
      <p className="text-gray-500 mb-8">Learning that Learns You Back</p>

      <h2 className="text-lg font-semibold text-gray-700 mb-4">Choose a student to continue</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
        {students.map((s) => (
          <button
            key={s.id}
            onClick={() => selectStudent(s.id)}
            className="bg-white rounded-xl shadow p-5 text-left hover:shadow-lg hover:border-indigo-400 border-2 border-transparent transition"
          >
            <div className="text-xl font-bold text-gray-800">{s.name}</div>
            <div className="text-sm text-indigo-600 font-medium mt-1">{s.learning_style} Learner</div>
            <div className="text-sm text-gray-500 mt-2">{s.grade}</div>
            <div className="text-sm text-gray-400 mt-1">Goal: {s.goal}</div>
          </button>
        ))}
      </div>
	  <p className="text-xs text-gray-400 mt-10">
  Built for a Microsoft Agent Leagues Hackathon · "AI That Adapts. Students Who Thrive."
</p>
    </div>
  );
}