import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getDashboard, generatePlan, getResources } from "../api";
import type { DashboardData, Resource } from "../api";
import ChatWidget from "../components/ChatWidget";
import ResourceCard from "../components/ResourceCard";

const gapColor = {
  high: "bg-red-100 border-red-400 text-red-700",
  medium: "bg-yellow-100 border-yellow-400 text-yellow-700",
  low: "bg-green-100 border-green-400 text-green-700",
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [resources, setResources] = useState([]);
  const navigate = useNavigate();
  const studentId = Number(localStorage.getItem("studentId"));

  useEffect(() => {
    if (!studentId) { navigate("/"); return; }
    getDashboard(studentId).then(setData);
  }, [navigate, studentId]);

  useEffect(() => {
    if (data) {
      const weakest = [...data.mastery].sort((a, b) => a.mastery_percent - b.mastery_percent)[0];
      if (weakest) {
        getResources(weakest.topic_id, data.student.learning_style).then((all) => {
          if (all.length > 0) { setResources(all); }
          else { getResources(weakest.topic_id).then(setResources); }
        });
      }
    }
  }, [data]);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const result = await generatePlan(studentId);
      setData((prev) => prev ? { ...prev, plan: result.plan } : prev);
    } catch (err) {
      console.error("Failed to generate plan:", err);
    } finally {
      setGenerating(false);
    }
  };

  if (!data) return <div className="p-8">Loading...</div>;

  const chartData = data.mastery.map((m) => ({ name: m.topic_name, mastery: m.mastery_percent }));
  const weakestTopic = data.mastery.length > 0
    ? [...data.mastery].sort((a, b) => a.mastery_percent - b.mastery_percent)[0]
    : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{"Welcome, " + data.student.name.split(" ")[0]}</h1>
            <p className="text-gray-500">{data.student.learning_style + " Learner"}</p>
          </div>
          <button onClick={() => navigate("/")} className="text-sm text-indigo-600 hover:underline">Switch Student</button>
        </div>

        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Mastery Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="mastery" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Knowledge Gap Heatmap</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.mastery.map((m) => (
              <div key={m.topic_id} className={"rounded-lg border-2 p-4 text-center " + gapColor[m.gap_level]}>
                <div className="font-semibold">{m.topic_name}</div>
                <div className="text-2xl font-bold mt-1">{m.mastery_percent + "%"}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Your Personalized Study Plan</h2>
            <button onClick={handleGeneratePlan} disabled={generating}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">
              {generating ? "Generating..." : data.plan ? "Regenerate Plan" : "Generate My Plan"}
            </button>
          </div>
          {!data.plan && !generating && <p className="text-gray-400">No plan yet. Click Generate My Plan to get started.</p>}
          {generating && <p className="text-gray-400 animate-pulse">EduPath AI is building your plan...</p>}
          {data.plan && !generating && (
            <div className="space-y-3">
              {data.plan.plan.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-indigo-600">{item.day + " - " + item.topic}</div>
                    <div className="text-gray-800 mt-1">{item.task}</div>
                    <div className="text-xs text-gray-400 mt-1 italic">{item.reason}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <a href={item.resource_url} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline block">{item.resource_title}</a>
                    <div className="text-xs text-gray-400 mt-1">{item.duration_min + " min"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {resources.length > 0 && (
          <div className="bg-white rounded-xl shadow p-5 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">{"Recommended for You" + (weakestTopic ? " - " + weakestTopic.topic_name : "")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resources.map((r) => <ResourceCard key={r.id} resource={r} />)}
            </div>
          </div>
        )}
      </div>

      <ChatWidget
        studentId={studentId}
        weakestTopicId={weakestTopic ? weakestTopic.topic_id : null}
        weakestTopicName={weakestTopic ? weakestTopic.topic_name : null}
      />
    </div>
  );
}
