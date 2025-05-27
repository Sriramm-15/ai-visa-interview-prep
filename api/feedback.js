import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { questions, answers, tuitionFee, livingExpenses, fundingAmount, currentUniversityName } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const totalExpenses = tuitionFee + livingExpenses;

    // Build the prompt with questions/answers and financials
    let prompt = `You are an expert US student visa officer. Your task is to provide comprehensive and structured feedback on a mock F1 visa interview.

--- Interview Details ---
University Applying To: ${currentUniversityName || "Not Provided"}
Questions and Answers:
`;
    for (let i = 0; i < questions.length; i++) {
      prompt += `Q${i + 1}: ${questions[i]}\nA${i + 1}: ${answers[i] || "(no answer provided for this question)"}\n`;
    }

    prompt += `\nFinancial Summary:\nTuition Fee: $${tuitionFee}\nLiving Expenses: $${livingExpenses}\nTotal Expenses: $${totalExpenses}\nFunding Amount: $${fundingAmount}\n\n`;

    prompt += `--- General Interview Feedback ---
Provide an overall summary of the applicant's performance. You MUST include a score out of 5 for each of these three aspects, even if the score is 0:
1. Response quality and clarity
2. Behavior and confidence (inferred from answer directness/completeness)
3. Financial profile strength.
Include concrete and actionable suggestions for improvement. This section is mandatory.

--- VO Suggestions Section ---
For each question asked, provide an "Ideal Answer" from the perspective of a well-prepared F1 visa applicant. These are the specific suggestions the Visa Officer (VO) would give for improvements or best practices for each individual question. If an ideal answer is not needed for a question, state "No particular suggestion for this question." You MUST format this section as a list of "Q: [Original Question]" followed by "VO Suggestion: [Ideal Answer]". This section is mandatory.

Ensure there are NO other introductory or concluding remarks outside these two main sections. Start directly with the "General Interview Feedback" section after the "Interview Details".`;

    // Call Gemini API to generate the feedback
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const fullResponseText = response.text();

    res.status(200).json({ feedback: fullResponseText.trim() });

  } catch (error) {
    console.error("Error in /api/feedback:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
