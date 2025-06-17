import { db } from './firebase-config.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

class CyberSafetyQuiz {
  constructor() {
    this.quizData = [];
    this.currentQuestionIndex = 0;
    this.userAnswers = new Map();
    this.userInfo = {};
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Start quiz button
    document.getElementById("start-quiz").addEventListener("click", () => {
      this.handleStartQuiz();
    });

    // Navigation buttons
    document.getElementById("prev-question").addEventListener("click", () => {
      this.navigateToQuestion(this.currentQuestionIndex - 1);
    });

    document.getElementById("next-question").addEventListener("click", () => {
      this.handleNextQuestion();
    });

    // Submit button
    document.getElementById("submit").addEventListener("click", () => {
      this.handleSubmitQuiz();
    });

    // Form validation
    this.setupFormValidation();
  }

  setupFormValidation() {
    const nameInput = document.getElementById("user-name");
    const ageInput = document.getElementById("user-age");
    const institutionSelect = document.getElementById("user-institution");

    // Real-time validation
    nameInput.addEventListener("input", () => this.validateName());
    ageInput.addEventListener("input", () => this.validateAge());
    institutionSelect.addEventListener("change", () => this.validateInstitution());

    // Enter key support
    document.getElementById("user-info-form").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.handleStartQuiz();
      }
    });
  }

  validateName() {
    const nameInput = document.getElementById("user-name");
    const nameError = document.getElementById("name-error");
    
    if (nameInput.value.trim().length < 2) {
      nameError.textContent = "Name must be at least 2 characters long";
      nameInput.style.borderColor = "#e74c3c";
      return false;
    } else {
      nameError.textContent = "";
      nameInput.style.borderColor = "#e1e8ed";
      return true;
    }
  }

  validateAge() {
    const ageInput = document.getElementById("user-age");
    const ageError = document.getElementById("age-error");
    const age = parseInt(ageInput.value);
    
    if (!age || age < 10 || age > 100) {
      ageError.textContent = "Please enter a valid age between 10 and 100";
      ageInput.style.borderColor = "#e74c3c";
      return false;
    } else {
      ageError.textContent = "";
      ageInput.style.borderColor = "#e1e8ed";
      return true;
    }
  }

  validateInstitution() {
    const institutionSelect = document.getElementById("user-institution");
    const institutionError = document.getElementById("institution-error");
    
    if (!institutionSelect.value) {
      institutionError.textContent = "Please select your institution type";
      institutionSelect.style.borderColor = "#e74c3c";
      return false;
    } else {
      institutionError.textContent = "";
      institutionSelect.style.borderColor = "#e1e8ed";
      return true;
    }
  }

  async handleStartQuiz() {
    // Validate form
    const isNameValid = this.validateName();
    const isAgeValid = this.validateAge();
    const isInstitutionValid = this.validateInstitution();

    if (!isNameValid || !isAgeValid || !isInstitutionValid) {
      this.showFormError("Please correct the errors above before continuing.");
      return;
    }

    // Store user info
    this.userInfo = {
      name: document.getElementById("user-name").value.trim(),
      age: parseInt(document.getElementById("user-age").value),
      institution: document.getElementById("user-institution").value
    };

    // Store in localStorage for certificate generation
    localStorage.setItem("userName", this.userInfo.name);
    localStorage.setItem("userAge", this.userInfo.age);
    localStorage.setItem("userInstitution", this.userInfo.institution);

    // Show loading and transition to quiz
    this.showLoadingState();
    
    try {
      await this.loadQuizData();
      this.initializeQuiz();
    } catch (error) {
      console.error("Error loading quiz:", error);
      this.showError("Failed to load quiz questions. Please try again.");
    }
  }

  showFormError(message) {
    // Create or update error message at the top of the form
    let errorDiv = document.querySelector(".form-general-error");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.className = "form-general-error";
      errorDiv.style.cssText = `
        background: #fee;
        color: #e74c3c;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 1rem;
        border: 1px solid #f5c6cb;
        font-size: 0.9rem;
      `;
      document.querySelector(".user-form").prepend(errorDiv);
    }
    errorDiv.textContent = message;
  }

  showLoadingState() {
    const startBtn = document.getElementById("start-quiz");
    startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting Quiz...';
    startBtn.disabled = true;
  }

  async loadQuizData() {
    const snapshot = await get(ref(db, "quizzes"));
    this.quizData = [];
    
    snapshot.forEach(child => {
      this.quizData.push({
        id: child.key,
        ...child.val()
      });
    });
  
    if (this.quizData.length === 0) {
      throw new Error("No quiz questions found");
    }
  
    // Shuffle the questions array
    this.shuffleQuestions();
    
    // If you want to limit the number of questions (optional)
    // this.quizData = this.quizData.slice(0, 10); // Show only 10 random questions
  }
  
  shuffleQuestions() {
    // Fisher-Yates shuffle algorithm
    for (let i = this.quizData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.quizData[i], this.quizData[j]] = [this.quizData[j], this.quizData[i]];
    }
    
    // Also shuffle the options for each question
    this.quizData.forEach(question => {
      this.shuffleArray(question.options);
    });
  }
  
  shuffleArray(array) {
    // Create a copy of the array to avoid modifying the original
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  initializeQuiz() {
    // Hide form and show quiz
    document.getElementById("user-form").style.display = "none";
    document.getElementById("quiz-section").style.display = "block";
  
    // Optional: Select a random subset of questions (e.g., 10 out of all available)
    // this.quizData = this.quizData.slice(0, 10);
    
    // Set up progress tracking
    document.getElementById("total-questions").textContent = this.quizData.length;
    
    // Render all questions
    this.renderQuestions();
    
    // Show first question
    this.navigateToQuestion(0);
  }

  renderQuestions() {
    const container = document.getElementById("quiz-container");
    container.innerHTML = "";
  
    this.quizData.forEach((questionData, index) => {
      const questionDiv = document.createElement("div");
      questionDiv.className = "question-item";
      questionDiv.id = `question-${index}`;
      
      // Shuffle options again in case they weren't shuffled during load
      const shuffledOptions = this.shuffleArray(questionData.options);
      
      questionDiv.innerHTML = `
        <div class="question-title">
          <span class="question-number">Question ${index + 1}:</span>
          ${questionData.question}
        </div>
        <div class="options-container">
          ${shuffledOptions.map((option, optionIndex) => `
            <div class="option-item">
              <input type="radio" 
                     id="q${index}_opt${optionIndex}" 
                     name="question_${index}" 
                     value="${option}"
                     ${this.userAnswers.get(index) === option ? 'checked' : ''}>
              <label for="q${index}_opt${optionIndex}">${option}</label>
            </div>
          `).join('')}
        </div>
      `;
  
      // Add event listeners for this question's options
      questionDiv.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          this.userAnswers.set(index, e.target.value);
          this.updateNavigationButtons();
        });
      });
  
      container.appendChild(questionDiv);
    });
  }

  navigateToQuestion(questionIndex) {
    // Check if feedback is currently showing
    if (document.querySelector('.correct-answer-feedback')) {
      return;
    }
  
    if (questionIndex < 0 || questionIndex >= this.quizData.length) {
      return;
    }
  
    // Hide all questions
    document.querySelectorAll('.question-item').forEach(item => {
      item.classList.remove('active');
    });
  
    // Show current question
    const currentQuestion = document.getElementById(`question-${questionIndex}`);
    if (currentQuestion) {
      currentQuestion.classList.add('active');
    }
  
    this.currentQuestionIndex = questionIndex;
    this.updateProgress();
    this.updateNavigationButtons();
  
    // Scroll to the question (optional, but improves UX)
    if (currentQuestion) {
      currentQuestion.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }
  updateProgress() {
    const progress = ((this.currentQuestionIndex + 1) / this.quizData.length) * 100;
    document.getElementById("progress-fill").style.width = `${progress}%`;
    document.getElementById("current-question").textContent = this.currentQuestionIndex + 1;
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById("prev-question");
    const nextBtn = document.getElementById("next-question");
    const submitBtn = document.getElementById("submit");

    // Previous button
    if (this.currentQuestionIndex === 0) {
      prevBtn.style.display = "none";
    } else {
      prevBtn.style.display = "flex";
    }

    // Next/Submit button logic
    const isLastQuestion = this.currentQuestionIndex === this.quizData.length - 1;
    const hasAnsweredCurrent = this.userAnswers.has(this.currentQuestionIndex);

    if (isLastQuestion) {
      nextBtn.style.display = "none";
      submitBtn.style.display = "flex";
      submitBtn.disabled = !this.allQuestionsAnswered();
    } else {
      nextBtn.style.display = "flex";
      submitBtn.style.display = "none";
      nextBtn.disabled = !hasAnsweredCurrent;
    }
  }

  //new addition
  showCorrectAnswer() {
    const currentQuestion = this.quizData[this.currentQuestionIndex];
    const userAnswer = this.userAnswers.get(this.currentQuestionIndex);
    const isCorrect = userAnswer === currentQuestion.answer;
  
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'feedback-overlay';
    
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = `correct-answer-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    
    // Build feedback content
    feedback.innerHTML = `
      <div class="feedback-icon ${isCorrect ? 'correct' : 'incorrect'}">
        <i class="fas ${isCorrect ? 'fa-check' : 'fa-times'}"></i>
      </div>
      
      <div class="feedback-title ${isCorrect ? 'correct' : 'incorrect'}">
        ${isCorrect ? '🎉 Excellent!' : '❌ Not Quite Right'}
      </div>
      
      <div class="feedback-content">
        <div class="correct-answer">
          <strong>Correct Answer:</strong> ${currentQuestion.answer}
        </div>
        
        ${!isCorrect && userAnswer ? `
          <div class="user-answer">
            <strong>Your Answer:</strong> ${userAnswer}
          </div>
        ` : ''}
        
        ${!isCorrect && !userAnswer ? `
          <div class="user-answer">
            <strong>Your Answer:</strong> No answer selected
          </div>
        ` : ''}
        
        <div class="feedback-timer">
          <i class="fas fa-clock"></i>
          <span>Moving to next question...</span>
        </div>
        
        <div class="timer-progress">
          <div class="timer-bar"></div>
        </div>
      </div>
    `;
  
    // Add elements to DOM
    document.body.appendChild(overlay);
    document.body.appendChild(feedback);
  
    // Add click-to-dismiss functionality
    const dismissFeedback = () => {
      overlay.classList.add('fade-out');
      feedback.classList.add('fade-out');
      
      setTimeout(() => {
        overlay.remove();
        feedback.remove();
        this.navigateToQuestion(this.currentQuestionIndex + 1);
      }, 300);
    };
  
    // Auto-dismiss after 3 seconds
    const autoTimer = setTimeout(dismissFeedback, 3000);
  
    // Allow manual dismissal by clicking overlay
    overlay.addEventListener('click', () => {
      clearTimeout(autoTimer);
      dismissFeedback();
    });
  
    // Prevent dismissal when clicking on feedback content
    feedback.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  
    // Add keyboard support for better accessibility
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        clearTimeout(autoTimer);
        document.removeEventListener('keydown', handleKeyPress);
        dismissFeedback();
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
  }
  

  handleNextQuestion() {
    if (this.currentQuestionIndex < this.quizData.length - 1) {
      this.showCorrectAnswer();
    }
  }

  allQuestionsAnswered() {
    return this.userAnswers.size === this.quizData.length;
  }

  handleSubmitQuiz() {
    if (!this.allQuestionsAnswered()) {
      alert("Please answer all questions before submitting.");
      return;
    }
  
    // Show feedback before submitting
    this.showCorrectAnswer();
    
    // Wait for feedback to complete before submitting
    setTimeout(() => {
      document.getElementById("quiz-section").style.display = "none";
      document.getElementById("results-preview").style.display = "block";
      this.calculateAndRedirect();
    }, 3000);
  }

  calculateAndRedirect() {
    let score = 0;
    
    this.quizData.forEach((questionData, index) => {
      const userAnswer = this.userAnswers.get(index);
      if (userAnswer === questionData.answer) {
        score++;
      }
    });
  
    const percentage = Math.round((score / this.quizData.length) * 100);
    
    // Store results
    localStorage.setItem("quizScore", percentage);
    localStorage.setItem("totalQuestions", this.quizData.length);
    localStorage.setItem("correctAnswers", score);
    localStorage.setItem("quizCompletedAt", new Date().toISOString());
  
    // Store detailed results for review - include original question order
    const detailedResults = this.quizData.map((questionData, index) => ({
      question: questionData.question,
      userAnswer: this.userAnswers.get(index),
      correctAnswer: questionData.answer,
      isCorrect: this.userAnswers.get(index) === questionData.answer
    }));
    
    localStorage.setItem("detailedResults", JSON.stringify(detailedResults));
    localStorage.setItem("quizQuestionsOrder", JSON.stringify(this.quizData.map(q => q.id)));
  
    // Redirect to certificate page
    window.location.href = "certificate.html";
  }

  showError(message) {
    const container = document.getElementById("quiz-container");
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #e74c3c;">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
        <h3>Oops! Something went wrong</h3>
        <p>${message}</p>
        <button onclick="location.reload()" style="
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 1rem;
        ">
          Try Again
        </button>
      </div>
    `;
  }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new CyberSafetyQuiz();
});

// Add some CSS for better error styling
const style = document.createElement('style');
style.textContent = `
  .nav-btn:disabled,
  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  .nav-btn:disabled:hover,
  .submit-btn:disabled:hover {
    transform: none !important;
    box-shadow: none !important;
  }
`;
document.head.appendChild(style);