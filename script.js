const landingView = document.getElementById("landing");
const resourcesView = document.getElementById("resources");
const interviewView = document.getElementById("interview");

const resourcesBtn = document.getElementById("resources-btn");
const startInterviewBtn = document.getElementById("start-interview-btn");
const backFromResourcesBtn = document.getElementById("back-from-resources");
const backFromInterviewBtn = document.getElementById("back-from-interview");

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

startInterviewBtn.onclick = () => {
  landingView.classList.remove("active");
  interviewView.classList.add("active");
  startInterview();
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
  "Why USA?",
  "Why not India?",
  "Who is sponsoring your education and please estimate your tuition fee and living expenses in USD.",
  "What is the total funding amount you have for your education in USD?",
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

    // Add this line to make VO speak the question
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

    showFeedback();
  }
}

submitBtn.onclick = () => {
  const answer = userInput.value.trim();
  if (!answer) return alert("Please enter your answer or use voice recording.");

  addChatEntry("student", answer);

  // Question 9 (index 8): tuition + living
  if (currentQuestionIndex === 8) {
    const nums = answer.match(/[\d,.]+/g);
    if (nums && nums.length >= 2) {
      tuitionFee = parseUSD(nums[0]);
      livingExpenses = parseUSD(nums[1]);
    } else {
      tuitionFee = parseUSD(answer);
      livingExpenses = 0;
    }
  }

  // Question 10 (index 9): funding amount
  if (currentQuestionIndex === 9) {
    fundingAmount = parseUSD(answer); // ✅ Fix applied here
  }

  currentQuestionIndex++;
  askQuestion();
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
  };
  recognition.onerror = () => {
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
}

