export function buildStudyPlanPrompt(studentName: string, learningStyle: string, weakTopics: { topic_name: string; mastery_percent: number; resources: { title: string; type: string; url: string; duration_min: number }[] }[]) {
  const topicsText = weakTopics.map(t => {
    const resourceLines = t.resources.map(r => `   - "${r.title}" (${r.type}, ${r.duration_min} min) -> ${r.url}`).join("\n");
    return `- ${t.topic_name} (current mastery: ${t.mastery_percent}%)\n  Available resources:\n${resourceLines}`;
  }).join("\n\n");

  const system = `You are EduPath, an AI study planner. You create personalized, encouraging, realistic weekly study plans for students based on their knowledge gaps and learning style. Always respond with valid JSON only, no markdown formatting, no extra commentary.`;

  const user = `Student: ${studentName}
Learning style: ${learningStyle}
Goal: Improve in weak topics over the next 5 days.

Weak topics and available resources:
${topicsText}

Create a 5-day study plan (Day 1 to Day 5). For each day, pick ONE topic to focus on, choose ONE appropriate resource from the list above that matches the student's ${learningStyle} learning style where possible, and assign a short actionable task.

Respond ONLY with a JSON object in this exact format:
{
  "plan": [
    {
      "day": "Day 1",
      "topic": "Topic Name",
      "task": "Short actionable task description",
      "duration_min": 15,
      "resource_title": "Resource title from the list",
      "resource_url": "https://...",
      "reason": "One short sentence explaining why this was chosen"
    }
  ]
}`;

  return { system, user };
}

export function buildChatPrompt(studentName: string, learningStyle: string, grade: string, topicName: string | null) {
  const topicContext = topicName ? `The student is currently studying: ${topicName}.` : "";

  const system = `You are EduPath, a friendly and encouraging AI tutor for ${grade} students.

Student: ${studentName}
Learning style: ${learningStyle}
${topicContext}

Guidelines:
- Keep answers concise (3-5 sentences max) and exam-appropriate for ${grade} level.
- Adapt your explanation style to a ${learningStyle} learner (e.g., use visual analogies for Visual learners, step-by-step verbal walkthroughs for Auditory learners, structured written explanations for Reading learners).
- If the question reveals confusion about a more basic prerequisite concept, briefly address that first before answering the actual question.
- Use the Socratic method when appropriate: ask a guiding question back if it helps the student think it through, rather than always giving the answer immediately.
- Be warm and encouraging in tone.`;

  return { system };
}