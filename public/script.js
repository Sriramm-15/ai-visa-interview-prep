const landingView = document.getElementById("landing");
const resourcesView = document.getElementById("resources");
const interviewView = document.getElementById("interview");

const resourcesBtn = document.getElementById("resources-btn");
const startInterviewBtn = document.getElementById("start-interview-btn");
const backFromResourcesBtn = document.getElementById("back-from-resources");
const backFromInterviewBtn = document.getElementById("back-from-interview");

const loginModal = document.getElementById("loginModal");
const universityNameInput = document.getElementById("universityNameInput");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");

let currentUniversityName = "Not Provided"; // Initialize here
let userAnswers = [];

function speakText(text) {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.onerror = (event) => console.error("SpeechSynthesis error:", event.error);
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn("Speech synthesis not supported in this browser.");
    }
}

// --- Navigation Functions ---
resourcesBtn.onclick = () => {
    landingView.classList.remove("active");
    resourcesView.classList.add("active");
};

startInterviewBtn.onclick = () => {
    loginModal.style.display = "flex"; // Show the login modal
    universityNameInput.value = ""; // Reset university name input on modal open
};

loginSubmitBtn.onclick = () => {
    const universityName = universityNameInput.value.trim();
    if (universityName) {
        console.log("University Name entered:", universityName);
        loginModal.style.display = "none"; // Hide the login modal
        landingView.classList.remove("active");
        interviewView.classList.add("active");
        currentUniversityName = universityName; // Store university name for the current session
        startInterview(); // Start the interview only after login
    } else {
        alert("Please enter your university name to start the interview.");
    }
};

backFromResourcesBtn.onclick = () => {
    resourcesView.classList.remove("active");
    landingView.classList.add("active");
};

backFromInterviewBtn.onclick = () => {
    interviewView.classList.remove("active");
    landingView.classList.add("active");
    resetInterview();
};

// --- Interview Questions ---
const questions = [
    "Good morning! How are you today?",
    "What is the purpose of your visit?",
    "How many universities have you applied to?",
    "How many admits have you received?",
    "Which university are you going to?",
    "Why did you choose only this university? Why not others?",
    "Why Masters Now?",
    "Which course are you going for",
    "Explain Course Curriculum",
    "Who is sponsoring your education and please estimate your tuition fee and living expenses in USD.",
    "What is the total funding amount you have for your education in USD?",
    "Why USA?",
    "Why not India?",
    "Have you ever been rejected for a visa before?",
    "Why Your Previous visa rejected?",
    "What Changes have u made so far?",
    "How will you overcome the reason for your previous rejection?",
    "Do you have any relatives in the USA?",
    "What will you do after graduation?",
    "What ties do you have to your home country?",
    "What makes you return to your country after your studies?"
];

let currentQuestionIndex = 0;
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const submitBtn = document.getElementById("submit-btn");
const startRecBtn = document.getElementById("start-rec-btn");
const stopRecBtn = document.getElementById("stop-rec-btn");
const inputLabel = document.getElementById("input-label");
const feedbackBox = document.getElementById("feedback");

let tuitionFee = 0;
let livingExpenses = 0;
let fundingAmount = 0;

// New element to hold the "Improvements" button
const improvementsBtnContainer = document.createElement('div');
improvementsBtnContainer.classList.add('improvements-button-container');
feedbackBox.parentNode.insertBefore(improvementsBtnContainer, feedbackBox.nextSibling);

// New modal/section for VO suggestions
const voSuggestionsModal = document.createElement('div');
voSuggestionsModal.id = 'voSuggestionsModal';
voSuggestionsModal.style.display = 'none';
voSuggestionsModal.style.position = 'fixed';
voSuggestionsModal.style.top = '0';
voSuggestionsModal.style.left = '0';
voSuggestionsModal.style.width = '100%';
voSuggestionsModal.style.height = '100%';
voSuggestionsModal.style.background = 'rgba(0,0,0,0.8)';
voSuggestionsModal.style.zIndex = '1001';
voSuggestionsModal.style.alignItems = 'center';
voSuggestionsModal.style.justifyContent = 'center';
voSuggestionsModal.innerHTML = `
    <div style="background:#002244; padding:2rem; border-radius:10px; max-width:600px; width:90%; max-height: 80vh; overflow-y: auto; color: #fff;">
        <h2 style="color: #ffbd59; margin-top: 0;">VO Suggestions & Ideal Answers</h2>
        <div id="voSuggestionsContent" style="text-align: left; margin-bottom: 1rem; white-space: pre-wrap;"></div>
        <button id="closeVoSuggestions" style="background:#ffbd59; color:#002244; padding:0.5rem 1rem; border:none; border-radius:5px; cursor:pointer;">Close</button>
    </div>
`;
document.body.appendChild(voSuggestionsModal);

// Event listener for closing the VO suggestions modal
document.getElementById('closeVoSuggestions').onclick = () => {
    voSuggestionsModal.style.display = 'none';
};

// --- Core Interview Logic ---
function addChatEntry(sender, text) {
    const div = document.createElement("div");
    div.classList.add("chat-entry");
    const span = document.createElement("span");
    span.textContent = (sender === "VO" ? "Visa Officer: " : "You: ");
    span.classList.add(sender === "VO" ? "vo" : "student");
    div.appendChild(span);
    div.appendChild(document.createTextNode(text)); // Use textNode for safety
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function parseUSD(input) {
    let num = input.replace(/[^0-9\.]/g, '');
    return parseFloat(num) || 0;
}

// Speech Recognition setup
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.interimResults = false;
recognition.maxAlternatives = 1;
recognition.lang = "en-US";

let isListening = false;

recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    userInput.value = speechResult;
    stopSpeechRecognition(); // Stop listening immediately after result
    submitBtn.click(); // Programmatically click submit after speech recognition
};

recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    inputLabel.textContent = "Error during speech recognition.";
    isListening = false;
    startRecBtn.disabled = false;
    stopRecBtn.disabled = true;
    speakText("I didn't catch that. Please try again or type your answer.");
};

recognition.onend = () => {
    if (isListening) { // Only update UI if we explicitly stopped (not via onresult click)
        inputLabel.textContent = "Type or speak your answer:";
        startRecBtn.disabled = false;
        stopRecBtn.disabled = true;
        isListening = false;
    }
};

function startSpeechRecognition() {
    inputLabel.textContent = "Listening...";
    startRecBtn.disabled = true;
    stopRecBtn.disabled = false;
    isListening = true;
    try {
        recognition.start();
    } catch (e) {
        console.error("Recognition already started or other error:", e);
        inputLabel.textContent = "Speech recognition error. Already listening?";
        isListening = false;
        startRecBtn.disabled = false;
        stopRecBtn.disabled = true;
    }
}

function stopSpeechRecognition() {
    recognition.stop();
    inputLabel.textContent = "Processing...";
    isListening = false; // Set to false so onend doesn't reset UI when we stop deliberately
    startRecBtn.disabled = false;
    stopRecBtn.disabled = true;
}

startRecBtn.onclick = startSpeechRecognition;
stopRecBtn.onclick = stopSpeechRecognition;

// Function to handle interview flow
function startInterview() {
    chatBox.innerHTML = "";
    userAnswers = [];
    currentQuestionIndex = 0;
    feedbackBox.innerHTML = ""; // Clear previous feedback
    improvementsBtnContainer.innerHTML = ""; // Clear improvements button
    askNextQuestion();
}

function askNextQuestion() {
    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        addChatEntry("VO", question);
        speakText(question);
        userInput.value = "";
        userInput.focus();
        submitBtn.disabled = false;
        userInput.disabled = false;
        startRecBtn.disabled = false;
        stopRecBtn.disabled = true; // Stop button initially disabled
    } else {
        // If all questions are asked, proceed to end the interview and get feedback
        endInterview();
    }
}

submitBtn.onclick = async () => {
    const answer = userInput.value.trim();
    if (!answer && isListening) { // If user tried to speak but nothing was captured
        speakText("I didn't hear anything. Please try again.");
        return;
    }
    if (!answer) {
        speakText("Please provide an answer.");
        return;
    }

    addChatEntry("You", answer);
    userAnswers.push(answer);
    userInput.value = "";
    submitBtn.disabled = true;
    userInput.disabled = true;
    startRecBtn.disabled = true;
    stopRecBtn.disabled = true;

    // Special handling for financial questions
    const answeredQuestionIndex = currentQuestionIndex; // Index of the question just answered
    if (answeredQuestionIndex === 9) { // Answer to "Who is sponsoring... tuition fee and living expenses"
        const nums = answer.match(/\$?([\d,]+\.?\d*)/g); // More robust regex for numbers with optional $ and commas
        if (nums && nums.length >= 2) {
            tuitionFee = parseUSD(nums[0]);
            livingExpenses = parseUSD(nums[1]);
        } else if (nums && nums.length === 1) {
             tuitionFee = parseUSD(nums[0]);
             livingExpenses = 0;
             console.warn("Only one number found for tuition/living expenses. Assuming it's tuition.");
        } else {
            tuitionFee = 0;
            livingExpenses = 0;
            speakText("Please clarify your estimated tuition fee and living expenses.");
            submitBtn.disabled = false;
            userInput.disabled = false;
            startRecBtn.disabled = false;
            stopRecBtn.disabled = true;
            return;
        }
        console.log(`Parsed Tuition: $${tuitionFee}, Living Expenses: $${livingExpenses}`);
    } else if (answeredQuestionIndex === 10) { // Answer to "What is the total funding amount..."
        fundingAmount = parseUSD(answer);
        console.log(`Parsed Funding Amount: $${fundingAmount}`);
    }

    currentQuestionIndex++; // Move to the next question

    if (currentQuestionIndex < questions.length) {
        askNextQuestion(); // Ask the next question
    } else {
        // All questions asked, proceed to end interview and get final feedback
        endInterview();
    }
};

async function endInterview() {
    addChatEntry("VO", "Interview completed. Thank you!");
    speakText("Interview completed. Thank you!");
    userInput.disabled = true;
    submitBtn.disabled = true;
    startRecBtn.disabled = true;
    stopRecBtn.disabled = true;

    feedbackBox.textContent = "Getting AI feedback, please wait...";
    improvementsBtnContainer.innerHTML = ''; // Clear existing button

    try {
        const fullAiResponse = await getGeminiFeedback(questions, userAnswers, tuitionFee, livingExpenses, fundingAmount, currentUniversityName);
        const feedbackSections = parseAiResponse(fullAiResponse);

        // Display general feedback
        feedbackBox.innerHTML = `<strong>Feedback:</strong> <div class="feedback-content">${feedbackSections.generalFeedback}</div>`;
        // Create and display the "View Improvements" button
        const viewImprovementsBtn = document.createElement('button');
        viewImprovementsBtn.id = 'viewImprovementsBtn';
        viewImprovementsBtn.textContent = '💡 View Improvements';
        viewImprovementsBtn.onclick = () => {
            document.getElementById('voSuggestionsContent').innerHTML = feedbackSections.voSuggestions.replace(/\n/g, '<br>'); // Display in modal
            voSuggestionsModal.style.display = 'flex'; // Show modal
        };
        improvementsBtnContainer.appendChild(viewImprovementsBtn);

    } catch (error) {
        console.error("API Error getting feedback:", error);
        feedbackBox.innerHTML = `<span style="color: red;">Error getting feedback: ${error.message}. Please check console.</span>`;
        improvementsBtnContainer.innerHTML = ''; // Ensure button is cleared on error
    }
}

// Renamed and updated API call function
async function getGeminiFeedback(questions, answers, tuitionFee, livingExpenses, fundingAmount, universityName) {
    console.log("Sending feedback request to backend...");
    const response = await fetch("http://localhost:3000/api/feedback", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            questions,
            answers,
            tuitionFee,
            livingExpenses,
            fundingAmount,
            currentUniversityName: universityName
        }),
    });

    if (!response.ok) {
        let errorDetails = 'No detailed error message.';
        try {
            const errorData = await response.json();
            errorDetails = errorData.error || errorData.message || errorDetails;
        } catch (e) {
            errorDetails = response.statusText;
        }
        throw new Error(`Backend error: ${response.status} - ${errorDetails}`);
    }

    const data = await response.json();
    console.log("Received feedback from backend:", data);
    return data.feedback; // Access the 'feedback' property from your backend response
}

// Function to parse AI response
function parseAiResponse(fullText) {
    // Corrected tags to match what the server.js prompt is asking Gemini to output
    const generalFeedbackTag = '--- General Interview Feedback ---';
    const voSuggestionsTag = '--- VO Suggestions Section ---';

    let generalFeedback = 'No general feedback found.';
    let voSuggestions = 'No VO suggestions found.';

    const generalFeedbackStartIndex = fullText.indexOf(generalFeedbackTag);
    const voSuggestionsStartIndex = fullText.indexOf(voSuggestionsTag);

    if (generalFeedbackStartIndex !== -1 && voSuggestionsStartIndex !== -1) {
        // Extract general feedback (from generalFeedbackTag to voSuggestionsTag)
        generalFeedback = fullText.substring(generalFeedbackStartIndex + generalFeedbackTag.length, voSuggestionsStartIndex).trim();
        // Extract VO suggestions (from voSuggestionsTag to end)
        voSuggestions = fullText.substring(voSuggestionsStartIndex + voSuggestionsTag.length).trim();
    } else if (generalFeedbackStartIndex !== -1) {
        // If only General Feedback section is found
        generalFeedback = fullText.substring(generalFeedbackStartIndex + generalFeedbackTag.length).trim();
    } else if (voSuggestionsStartIndex !== -1) {
        // If only VO Suggestions section is found
        voSuggestions = fullText.substring(voSuggestionsStartIndex + voSuggestionsTag.length).trim();
    } else {
        // If no clear sections are found, treat the whole response as general feedback
        generalFeedback = fullText;
    }

    // Ensure default messages if parsing results in empty strings
    if (!generalFeedback) generalFeedback = 'AI provided no specific general feedback.';
    if (!voSuggestions) voSuggestions = 'AI provided no specific VO suggestions.';

    return { generalFeedback, voSuggestions };
}