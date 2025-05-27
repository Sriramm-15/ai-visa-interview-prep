# AI F1 Visa Interview Prep Tool

---

## Overview

This web-based application is designed to help F1 visa applicants practice for their visa interviews. It simulates a mock interview with a Visa Officer (VO) and provides instant, AI-powered feedback on your responses, including suggestions for ideal answers. The tool leverages the Google Gemini API for its intelligent feedback system.

---

## Features

* **Mock Interview Simulation:** Go through a series of common F1 visa interview questions.
* **AI-Powered Feedback:** Receive detailed feedback on your response quality, behavior, confidence, and financial profile strength, including a score.
* **VO Suggestions:** Get "Ideal Answers" provided by the AI for each question, guiding you on how to improve your responses.
* **Voice Recognition:** Speak your answers naturally using your browser's speech recognition (works best in Chrome or compatible browsers).
* **Local Session Saving:** All your interview sessions (questions, your answers, AI feedback) are saved locally in your browser's storage, allowing you to review your progress.
* **Downloadable Data:** Download the raw data of any past interview session as a JSON file for offline review or record-keeping.

---

## Technologies Used

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Node.js, Express.js
* **AI Integration:** Google Gemini API (`gemini-1.5-flash` model)
* **Environment Variables:** `dotenv` for secure API key management

---

## Setup and Installation

Follow these steps to get the AI F1 Visa Interview Prep Tool running on your local machine:

### 1. Clone the Repository

First, clone this GitHub repository to your local machine. If you haven't created the repository yet, you'll do that before this step and replace the placeholders.

```bash
git clone https://github.com/Sriramm-15/ai-visa-interview.git
cd ai-visa-interview # Navigate into the project directory
```

### 2. Install Dependencies
Navigate into the project directory and install the necessary Node.js packages for the backend:
```bash
npm install
```

### 3.. Get Your Google Gemini API Key
This application uses the Google Gemini API for its AI capabilities. You'll need to obtain an API key:

  a)Go to Google AI Studio and sign in with your Google account.
  b)On the left sidebar, click "Get API Key".
  c)Click "Create API key in new project" (or an existing one).
  d)Copy the generated API key immediately. It starts with AIza... and will not be shown 
    again.
    
### 4. Configure Environment Variables
Create a file named .env in the root of your project directory (the same directory as server.js and package.json).

Add your Gemini API key to this file:
```bash
GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY_HERE
```
(Replace YOUR_ACTUAL_GEMINI_API_KEY_HERE with the API key you copied from Google AI Studio. Ensure there are no spaces around the equals sign).

### 5. Start the Backend Server
Once your API key is set up, start the Node.js backend server:
```Bash
node server.js
```
### Contributing
Feel free to fork this repository, suggest improvements, or submit pull requests.
