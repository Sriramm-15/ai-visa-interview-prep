const landingView = document.getElementById("landing");
const resourcesView = document.getElementById("resources");
const interviewView = document.getElementById("interview");

const resourcesBtn = document.getElementById("resources-btn");
const startInterviewBtn = document.getElementById("start-interview-btn");
const backFromResourcesBtn = document.getElementById("back-from-resources");
const backFromInterviewBtn = document.getElementById("back-from-interview");

// Get modal elements
const loginModal = document.getElementById("loginModal");
const universityNameInput = document.getElementById("universityNameInput");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");

// Initialize userAnswers array
let userAnswers = [];

resourcesBtn.onclick = () => {
    landingView.classList.remove("active");
    resourcesView.classList.add("active");
};

function speakText(text) {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";

        utterance.onerror = (event) => {
            console.error("SpeechSynthesis error:", event.error);
        };

        utterance.onstart = () => {
            console.log("Speech started:", text);
        };

        utterance.onend = () => {
            console.log("Speech ended");
        };

        window.speechSynthesis.speak(utterance);
    } else {
        console.warn("Speech synthesis not supported in this browser.");
    }
}

// Modify startInterviewBtn to show the modal first
startInterviewBtn.onclick = () => {
    loginModal.style.display = "flex"; // Show the modal
};

// Handle login modal submission
loginSubmitBtn.onclick = () => {
    const universityName = universityNameInput.value.trim();
    if (universityName) {
        console.log("University Name entered:", universityName);
        loginModal.style.display = "none"; // Hide the modal
        landingView.classList.remove("active");
        interviewView.classList.add("active");
        startInterview();
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
    "Who is sponsoring your education and please estimate your tuition fee and living expenses in USD.", // Question 10 (index 9) for financial input
    "What is the total funding amount you have for your education in USD?", // Question 11 (index 10) for financial input
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

// Financial vars
let tuitionFee = 0;
let livingExpenses = 0;
let fundingAmount = 0;

function addChatEntry(sender, text) {
    const div = document.createElement("div");
    div.classList.add("chat-entry");
    const span = document.createElement("span");
    span.textContent = (sender === "VO" ? "Visa Officer: " : "You: ");
    span.classList.add(sender === "VO" ? "vo" : "student");
    div.appendChild(span);
    div.appendChild(document.createTextNode(text));
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function parseUSD(input) {
    let num = input.replace(/[^0-9\.]/g, '');
    return parseFloat(num) || 0;
}

function showFeedback() {
    let financialRating = 1;
    let totalExpensesUSD = tuitionFee + livingExpenses;

    if (fundingAmount >= totalExpensesUSD) {
        financialRating = 5;
    } else if (fundingAmount >= 0.75 * totalExpensesUSD) {
        financialRating = 4;
    } else if (fundingAmount >= 0.5 * totalExpensesUSD) {
        financialRating = 3;
    } else if (fundingAmount > 0) {
        financialRating = 2;
    } else {
        financialRating = 1;
    }

    feedbackBox.textContent =
        "Interview Feedback:\n\n" +
        "Response Quality: 5 / 5\n" +
        "Behaviour: 3 / 5\n" +
        "Financial Profile: " + financialRating + " / 5\n\n";

    if (financialRating === 5) {
        feedbackBox.textContent +=
            "Excellent funding! Your financial profile is very strong and fully covers your expenses.\n";
    } else if (financialRating >= 3) {
        feedbackBox.textContent +=
            "Good funding, but consider arranging a bit more to cover unexpected expenses.\n";
    } else {
        feedbackBox.textContent +=
            "Funding seems insufficient. Please secure more funds or clarify your support.\n";
    }

    feedbackBox.textContent +=
        "\nOverall, your responses were good. Keep practicing to improve confidence and clarity.";
}

function askQuestion() {
    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        addChatEntry("VO", question);

        speakText(question);

        userInput.value = "";
        userInput.focus();
        feedbackBox.textContent = "";
    } else {
        addChatEntry("VO", "Interview completed. Thank you!");
        speakText("Interview completed. Thank you!");
        userInput.disabled = true;
        submitBtn.disabled = true;
        startRecBtn.disabled = true;
        stopRecBtn.disabled = true;

        feedbackBox.textContent = "Getting AI feedback, please wait...";
        getChatGPTFeedback(questions, userAnswers, tuitionFee, livingExpenses, fundingAmount)
            .then(feedback => {
                feedbackBox.textContent = feedback;
            })
            .catch(error => {
                feedbackBox.textContent = "Error getting feedback: " + error.message;
                console.error("ChatGPT API Error:", error);
            });
    }
}

submitBtn.onclick = async () => {
    const answer = userInput.value.trim();
    if (!answer) {
        alert("Please enter your answer or use voice recording.");
        return;
    }

    addChatEntry("student", answer);
    userAnswers.push(answer);

    // Process financial questions at their specific indices
    if (currentQuestionIndex === 9) { // Q: Who is sponsoring your education and please estimate your tuition fee and living expenses in USD.
        const nums = answer.match(/[\d,.]+/g);
        if (nums && nums.length >= 2) {
            tuitionFee = parseUSD(nums[0]);
            livingExpenses = parseUSD(nums[1]);
        } else {
            tuitionFee = parseUSD(answer);
            livingExpenses = 0;
            console.warn("Could not parse both tuition and living expenses. Using only one value found.");
        }
        console.log(`Parsed Tuition: ${tuitionFee}, Living Expenses: ${livingExpenses}`);
    } else if (currentQuestionIndex === 10) { // Q: What is the total funding amount you have for your education in USD?
        fundingAmount = parseUSD(answer);
        console.log(`Parsed Funding Amount: ${fundingAmount}`);
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        askQuestion();
    } else {
        addChatEntry("VO", "Interview completed. Thank you!");
        speakText("Interview completed. Thank you!");
        userInput.disabled = true;
        submitBtn.disabled = true;
        startRecBtn.disabled = true;
        stopRecBtn.disabled = true;

        feedbackBox.textContent = "Getting AI feedback, please wait...";
        try {
            const feedback = await getChatGPTFeedback(questions, userAnswers, tuitionFee, livingExpenses, fundingAmount);
            feedbackBox.textContent = feedback;
        } catch (error) {
            feedbackBox.textContent = "Error getting feedback: " + error.message;
            console.error("ChatGPT API Error:", error);
        }
    }
};

// Voice recognition
let recognition;
if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
        startRecBtn.disabled = true;
        stopRecBtn.disabled = false;
        inputLabel.textContent = "Listening... Speak now.";
        userInput.value = "";
        userInput.focus();
    };
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        inputLabel.textContent = "Type your answer here or use voice recorder...";
        // submitBtn.click(); // Uncomment this line if you want auto-submit
    };
    recognition.onerror = (event) => {
        console.error("Voice recognition error:", event.error);
        inputLabel.textContent = "Voice recognition error. Try again.";
        startRecBtn.disabled = false;
        stopRecBtn.disabled = true;
    };
    recognition.onend = () => {
        startRecBtn.disabled = false;
        stopRecBtn.disabled = true;
        inputLabel.textContent = "Type your answer here or use voice recorder...";
    };

    startRecBtn.onclick = () => recognition.start();
    stopRecBtn.onclick = () => recognition.stop();
} else {
    startRecBtn.disabled = true;
    stopRecBtn.disabled = true;
    inputLabel.textContent = "Voice recognition not supported in this browser.";
}

function startInterview() {
    currentQuestionIndex = 0;
    chatBox.innerHTML = "";
    feedbackBox.textContent = "";
    userInput.disabled = false;
    submitBtn.disabled = false;
    if (recognition) {
        startRecBtn.disabled = false;
        stopRecBtn.disabled = true;
    }
    tuitionFee = 0;
    livingExpenses = 0;
    fundingAmount = 0;
    userAnswers = [];
    askQuestion();
}

function resetInterview() {
    chatBox.innerHTML = "";
    feedbackBox.textContent = "";
    userInput.value = "";
    userInput.disabled = false;
    submitBtn.disabled = false;
    if (recognition) {
        startRecBtn.disabled = false;
        stopRecBtn.disabled = true;
    }
    tuitionFee = 0;
    livingExpenses = 0;
    fundingAmount = 0;
    userAnswers = [];
    currentQuestionIndex = 0;
}

async function getChatGPTFeedback(questions, answers, tuitionFee, livingExpenses, fundingAmount) {
    try {
        const response = await fetch("/api/feedback", { // <-- CHANGE THIS LINE
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ questions, answers, tuitionFee, livingExpenses, fundingAmount }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.error}`);
        }

        const data = await response.json();
        return data.feedback;
    } catch (error) {
        console.error("Error fetching feedback:", error);
        throw error;
    }
}