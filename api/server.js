// api/index.js
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();

// CORS configuration:
// When deployed on Vercel, your frontend (e.g., ai-visa-interview-xxxx.vercel.app)
// and your backend (api/index.js) will be on the same domain or subdomain,
// so explicit CORS might not be strictly necessary for internal calls.
// However, keeping it can be robust. You might restrict it to your Vercel domain later.
app.use(cors());
app.use(express.json());

// IMPORTANT: process.env.GEMINI_API_KEY will be populated by Vercel's environment variables.
// No need for dotenv here, as Vercel handles it automatically.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/feedback", async (req, res) => {
    try {
        const { questions, answers, tuitionFee, livingExpenses, fundingAmount } = req.body;

        let totalExpenses = tuitionFee + livingExpenses;

        let prompt = `You are an expert US student visa officer. Provide detailed feedback on the following mock interview.`;

        prompt += `\n\n--- Interview Details ---`;
        prompt += `\nQuestions and Answers:\n`;
        for (let i = 0; i < questions.length; i++) {
            prompt += `Q${i + 1}: <span class="math-inline">\{questions\[i\]\}\\nA</span>{i + 1}: ${answers[i] || "(no answer provided for this question)"}\n`;
        }
        prompt += `\nFinancial Summary:\nTuition Fee: $${tuitionFee}\nLiving Expenses: $${livingExpenses}\nTotal Expenses: $${totalExpenses}\nFunding Amount: $${fundingAmount}\n\n`;

        prompt += `\n--- Feedback Section ---`;
        prompt += `\nPlease provide a "General Interview Feedback" with scores out of 5 for:\n1. Response quality and clarity\n2. Behavior and confidence\n3. Financial profile strength.\nInclude a summary and suggestions for improvement.`;

        prompt += `\n\n--- VO Suggestions Section ---`;
        prompt += `\nFor each question asked, provide an "Ideal Answer" from the perspective of a well-prepared F1 visa applicant. These are the suggestions the Visa Officer (VO) would give for improvements.
        Format this section as a list of "Q: [Original Question]" followed by "VO Suggestion: [Ideal Answer]".`;
        prompt += `\nEnsure the two main sections (Feedback and VO Suggestions) are clearly delineated by their headings.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const fullResponseText = response.text();

        res.json({ feedback: fullResponseText.trim() });
    } catch (error) {
        console.error("Error processing feedback request with Gemini:", error);
        if (error.response && error.response.status) {
            console.error("Gemini API Error Status:", error.response.status);
            console.error("Gemini API Error Data:", error.response.data);
        }
        res.status(500).json({ error: error.message || "An internal server error occurred." });
    }
});

// IMPORTANT: This exports the Express app for Vercel's serverless function environment.
export default app;