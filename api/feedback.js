import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { questions, answers, tuitionFee, livingExpenses, fundingAmount, currentUniversityName } = req.body;

    let totalExpenses = tuitionFee + livingExpenses;

    let prompt = `...`; 
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const fullResponseText = response.text();

    res.status(200).json({ feedback: fullResponseText.trim() });
  } catch (error) {
    console.error("Error processing feedback request:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
