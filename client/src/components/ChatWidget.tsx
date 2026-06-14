import { useState } from "react";
import { askDoubt } from "../api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  studentId: number;
  weakestTopicId: number | null;
  weakestTopicName: string | null;
}

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  Trigonometry: [
    "What do sine and cosine actually mean?",
    "How do I remember the trig identities?",
    "Why does SOH-CAH-TOA work?",
  ],
  "Physics Basics": [
    "What's the difference between speed and velocity?",
    "Can you explain Newton's First Law simply?",
    "Why does force equal mass times acceleration?",
  ],
  Algebra: [
    "How do I solve for x in a quadratic equation?",
    "What's the difference between an expression and an equation?",
  ],
  Geometry: [
    "How do I find the area of a triangle?",
    "What's the Pythagorean theorem used for?",
  ],
};

export default function ChatWidget({ studentId, weakestTopicId, weakestTopicName }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestions = weakestTopicName ? (SUGGESTED_QUESTIONS[weakestTopicName] || []) : [];

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const result = await askDoubt(studentId, weakestTopicId, text);
      setMessages((prev) => [...prev, { role: "assistant", content: result.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full px-5 py-3 shadow-lg hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <span className="text-lg">💬</span>
          <span className="font-medium">Ask EduPath</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[90vw] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col h-[500px]">
          {/* Header */}
          <div className="bg-indigo-600 text-white rounded-t-xl px-4 py-3 flex justify-between items-center">
            <div>
              <div className="font-semibold">Ask EduPath</div>
              {weakestTopicName && <div className="text-xs text-indigo-100">Currently focused on: {weakestTopicName}</div>}
            </div>
            <button onClick={() => setOpen(false)} className="text-white hover:text-indigo-200">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-sm text-gray-400 text-center mt-4">
                Ask me anything about your topics! Here are some ideas:
              </div>
            )}

            {messages.length === 0 && suggestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(q)}
                className="block w-full text-left text-sm bg-indigo-50 text-indigo-700 rounded-lg px-3 py-2 hover:bg-indigo-100 transition"
              >
                {q}
              </button>
            ))}

            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-400 rounded-lg px-3 py-2 text-sm animate-pulse">
                  EduPath is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Type your question..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}