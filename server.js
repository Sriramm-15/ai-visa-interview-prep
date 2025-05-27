import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from 'path'; // Import the 'path' module
import { fileURLToPath } from 'url'; // Import for ES modules

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = 3000; // Frontend expects to talk to port 3000

app.use(cors());
app.use(express.json());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- API Route for Feedback Generation ---
app.post("/api/feedback", async (req, res) => {
    try {
        const { questions, answers, tuitionFee, livingExpenses, fundingAmount, currentUniversityName } = req.body;

        console.log("-----------------------------------------");
        console.log("Received /api/feedback request.");
        console.log("Request Body (partial):", {
            numQuestions: questions.length,
            numAnswers: answers.length,
            tuitionFee,
            livingExpenses,
            fundingAmount,
            currentUniversityName
        });
        console.log("-----------------------------------------");

        let totalExpenses = tuitionFee + livingExpenses;

        // --- STRONGLY REFINED PROMPT ---
        let prompt = `You are an expert US student visa officer. Your task is to provide comprehensive and structured feedback on a mock F1 visa interview.

**YOU MUST INCLUDE BOTH OF THE FOLLOWING SECTIONS IN YOUR RESPONSE, USING THEIR EXACT HEADINGS.** If you have no specific feedback for a section, state "No specific feedback at this time." or "No particular suggestions." within that section.

--- Interview Details ---
University Applying To: ${currentUniversityName || "Not Provided"}
Questions and Answers:
`;
        for (let i = 0; i < questions.length; i++) {
            prompt += `Q${i + 1}: ${questions[i]}\nA${i + 1}: ${answers[i] || "(no answer provided for this question)"}\n`;
        }
      se
    } catch (error) {
        console.error("-----------------------------------------");
        console.error("Error processing feedback request with Gemini:", error);
        if (error.response && error.response.status) {
            console.error("Gemini API Error Status:", error.response.status);
            console.error("Gemini API Error Data:", error.response.data);
        }
        console.error("-----------------------------------------");
        res.status(500).json({ error: error.message || "An internal server error occurred." });
    }
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle requests to the root URL by serving index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Frontend accessible via http://localhost:${port}`);
});