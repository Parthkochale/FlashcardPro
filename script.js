// ========================
// DOM ELEMENTS
// ========================
const startBtn = document.getElementById('startBtn');
const welcomeScreen = document.getElementById('welcomeScreen');
const mainApp = document.getElementById('mainApp');
const themeToggle = document.getElementById('themeToggle');

// Input elements
const qInput = document.getElementById('q');
const aInput = document.getElementById('a');
const difficultySelect = document.getElementById('difficulty');
const categorySelect = document.getElementById('category');
const addBtn = document.getElementById('addBtn');
const searchBox = document.getElementById('searchBox');

// Control buttons
const shuffleBtn = document.getElementById('shuffleBtn');
const quizBtn = document.getElementById('quizBtn');
const practiceBtn = document.getElementById('practiceBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const clearBtn = document.getElementById('clearBtn');
const restartBtn = document.getElementById('restartBtn');

// Display elements
const cardsContainer = document.getElementById('cardsContainer');
const emptyState = document.getElementById('emptyState');
const scoreText = document.getElementById('scoreText');
const progressBar = document.getElementById('progressBar');

// Stats elements
const totalCardsEl = document.getElementById('totalCards');
const masteredCardsEl = document.getElementById('masteredCards');
const accuracyRateEl = document.getElementById('accuracyRate');
const studyTimeEl = document.getElementById('studyTime');
const streakCountEl = document.getElementById('streakCount');
const levelTextEl = document.getElementById('levelText');

// Modal elements
const quizModal = document.getElementById('quizModal');
const closeQuiz = document.getElementById('closeQuiz');
const quizQuestion = document.getElementById('quizQuestion');
const quizAnswer = document.getElementById('quizAnswer');
const submitAnswerBtn = document.getElementById('submitAnswerBtn');
const hintBtn = document.getElementById('hintBtn');
const skipBtn = document.getElementById('skipBtn');
const quizScore = document.getElementById('quizScore');
const quizTimer = document.getElementById('quizTimer');
const quizProgressBar = document.getElementById('quizProgressBar');
const answerFeedback = document.getElementById('answerFeedback');
const questionNumber = document.getElementById('questionNumber');

// Filter tabs
const filterTabs = document.querySelectorAll('.tab-btn');

// ========================
// STATE VARIABLES
// ========================
let cards = [];
let currentFilter = 'all';
let score = 0;
let questionsAnswered = 0;
let masteredCount = 0;
let currentQuizCard = null;
let quizCards = [];
let quizIndex = 0;
let quizStartTime = null;
let quizTimerInterval = null;
let studyStartTime = Date.now();
let totalStudyTime = 0;
let streak = 0;

// ========================
// INITIALIZATION
// ========================
function init() {
  loadData();
  mainApp.style.display = 'none';
  
  // Event Listeners
  startBtn.addEventListener('click', startApp);
  themeToggle.addEventListener('click', toggleTheme);
  addBtn.addEventListener('click', addCard);
  clearBtn.addEventListener('click', clearAllCards);
  shuffleBtn.addEventListener('click', shuffleCards);
  quizBtn.addEventListener('click', startQuiz);
  practiceBtn.addEventListener('click', startPracticeMode);
  exportBtn.addEventListener('click', exportCards);
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', importCards);
  restartBtn.addEventListener('click', restartProgress);
  searchBox.addEventListener('input', filterCards);
  
  // Quiz modal
  closeQuiz.addEventListener('click', closeQuizModal);
  submitAnswerBtn.addEventListener('click', submitAnswer);
  hintBtn.addEventListener('click', showHint);
  skipBtn.addEventListener('click', skipQuestion);
  
  // Filter tabs
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderCards();
    });
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && quizModal.classList.contains('active')) {
      submitAnswer();
    }
  });
  
  // Update study time every minute
  setInterval(updateStudyTime, 60000);
}

// ========================
// DATA MANAGEMENT
// ========================
function loadData() {
  const savedCards = localStorage.getItem('flashcardProCards');
  const savedScore = localStorage.getItem('flashcardProScore');
  const savedQuestionsAnswered = localStorage.getItem('flashcardProQuestionsAnswered');
  const savedStudyTime = localStorage.getItem('flashcardProStudyTime');
  const savedStreak = localStorage.getItem('flashcardProStreak');
  
  if (savedCards) {
    cards = JSON.parse(savedCards);
  } else {
    // Default cards
    cards = [
      { q: "What is Java?", a: "A high-level, object-oriented programming language.", difficulty: "easy", category: "java", mastered: false },
      { q: "What does HTML stand for?", a: "HyperText Markup Language.", difficulty: "easy", category: "programming", mastered: false },
      { q: "What is the purpose of CSS?", a: "To style and layout web pages.", difficulty: "medium", category: "programming", mastered: false },
      { q: "What does JS stand for?", a: "JavaScript.", difficulty: "easy", category: "programming", mastered: false },
      { q: "What is an array?", a: "A collection of elements stored under a single variable.", difficulty: "medium", category: "theory", mastered: false }
    ];
    saveData();
  }
  
  score = savedScore ? parseInt(savedScore) : 0;
  questionsAnswered = savedQuestionsAnswered ? parseInt(savedQuestionsAnswered) : 0;
  totalStudyTime = savedStudyTime ? parseInt(savedStudyTime) : 0;
  streak = savedStreak ? parseInt(savedStreak) : 0;
  
  updateStats();
}

function saveData() {
  localStorage.setItem('flashcardProCards', JSON.stringify(cards));
  localStorage.setItem('flashcardProScore', score.toString());
  localStorage.setItem('flashcardProQuestionsAnswered', questionsAnswered.toString());
  localStorage.setItem('flashcardProStudyTime', totalStudyTime.toString());
  localStorage.setItem('flashcardProStreak', streak.toString());
}

// ========================
// APP CONTROL
// ========================
function startApp() {
  welcomeScreen.style.display = 'none';
  mainApp.style.display = 'block';
  renderCards();
  updateStats();
  studyStartTime = Date.now();
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const icon = themeToggle.querySelector('i');
  if (document.body.classList.contains('dark-theme')) {
    icon.className = 'fas fa-sun';
  } else {
    icon.className = 'fas fa-moon';
  }
}

// ========================
// CARD MANAGEMENT
// ========================
function addCard() {
  const question = qInput.value.trim();
  const answer = aInput.value.trim();
  const difficulty = difficultySelect.value;
  const category = categorySelect.value;
  
  if (!question || !answer) {
    showNotification('Please enter both question and answer!', 'error');
    return;
  }
  
  cards.push({
    q: question,
    a: answer,
    difficulty: difficulty,
    category: category,
    mastered: false
  });
  
  qInput.value = '';
  aInput.value = '';
  saveData();
  renderCards();
  updateStats();
  showNotification('Card added successfully!', 'success');
}

function deleteCard(index) {
  if (confirm('Are you sure you want to delete this card?')) {
    cards.splice(index, 1);
    saveData();
    renderCards();
    updateStats();
    showNotification('Card deleted!', 'success');
  }
}

function toggleMastered(index) {
  cards[index].mastered = !cards[index].mastered;
  saveData();
  renderCards();
  updateStats();
  
  if (cards[index].mastered) {
    showAchievement('Card Mastered!', 'You\'ve mastered this card!');
  }
}

function clearAllCards() {
  if (confirm('Are you sure you want to clear all cards? This action cannot be undone!')) {
    cards = [];
    saveData();
    renderCards();
    updateStats();
    showNotification('All cards cleared!', 'success');
  }
}

function shuffleCards() {
  cards = cards.sort(() => Math.random() - 0.5);
  saveData();
  renderCards();
  showNotification('Cards shuffled!', 'success');
}

// ========================
// RENDERING
// ========================
function renderCards() {
  const searchTerm = searchBox.value.toLowerCase();
  let filteredCards = cards;
  
  // Apply filter
  if (currentFilter !== 'all') {
    if (currentFilter === 'mastered') {
      filteredCards = cards.filter(card => card.mastered);
    } else {
      filteredCards = cards.filter(card => card.difficulty === currentFilter);
    }
  }
  
  // Apply search
  if (searchTerm) {
    filteredCards = filteredCards.filter(card => 
      card.q.toLowerCase().includes(searchTerm) || 
      card.a.toLowerCase().includes(searchTerm)
    );
  }
  
  cardsContainer.innerHTML = '';
  
  if (filteredCards.length === 0) {
    emptyState.style.display = 'block';
    cardsContainer.style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    cardsContainer.style.display = 'grid';
    
    filteredCards.forEach((card, index) => {
      const actualIndex = cards.indexOf(card);
      const cardEl = createCardElement(card, actualIndex);
      cardsContainer.appendChild(cardEl);
    });
  }
}

function createCardElement(card, index) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'flashcard';
  
  cardDiv.innerHTML = `
    <div class="flashcard-inner">
      <div class="flashcard-face flashcard-front">
        <span class="difficulty-badge difficulty-${card.difficulty}">${card.difficulty}</span>
        <div class="card-actions">
          <button class="action-btn mastered-btn ${card.mastered ? 'mastered' : ''}" onclick="toggleMastered(${index})" title="Mark as mastered">
            <i class="fas fa-check"></i>
          </button>
          <button class="action-btn delete-btn" onclick="deleteCard(${index})" title="Delete card">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="flashcard-content">${card.q}</div>
        <span class="category-badge">${card.category}</span>
      </div>
      <div class="flashcard-face flashcard-back">
        <div class="flashcard-content">${card.a}</div>
      </div>
    </div>
  `;
  
  cardDiv.addEventListener('click', (e) => {
    if (!e.target.closest('.action-btn')) {
      cardDiv.classList.toggle('flipped');
    }
  });
  
  return cardDiv;
}

function filterCards() {
  renderCards();
}

// ========================
// STATISTICS
// ========================
function updateStats() {
  // Total cards
  totalCardsEl.textContent = cards.length;
  
  // Mastered cards
  masteredCount = cards.filter(card => card.mastered).length;
  masteredCardsEl.textContent = masteredCount;
  
  // Accuracy rate
  if (questionsAnswered > 0) {
    const accuracy = Math.round((score / questionsAnswered) * 100);
    accuracyRateEl.textContent = `${accuracy}%`;
  } else {
    accuracyRateEl.textContent = '0%';
  }
  
  // Study time
  studyTimeEl.textContent = formatTime(totalStudyTime);
  
  // Streak
  streakCountEl.textContent = streak;
  
  // Level
  const level = Math.floor(score / 10) + 1;
  levelTextEl.textContent = `Level ${level}`;
  
  // Progress bar
  if (questionsAnswered > 0) {
    const percentage = (score / questionsAnswered) * 100;
    progressBar.style.width = `${percentage}%`;
  } else {
    progressBar.style.width = '0%';
  }
  
  // Score text
  scoreText.textContent = `Score: ${score} / ${questionsAnswered}`;
}

function updateStudyTime() {
  const elapsed = Math.floor((Date.now() - studyStartTime) / 60000);
  totalStudyTime += elapsed;
  studyStartTime = Date.now();
  saveData();
  updateStats();
}

function formatTime(minutes) {
  if (minutes < 60) {
    return `${minutes}m`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
}

function restartProgress() {
  if (confirm('Are you sure you want to restart your progress? This will reset your score and statistics.')) {
    score = 0;
    questionsAnswered = 0;
    totalStudyTime = 0;
    streak = 0;
    cards.forEach(card => card.mastered = false);
    saveData();
    updateStats();
    renderCards();
    showNotification('Progress restarted!', 'success');
  }
}

// ========================
// QUIZ MODE
// ========================
function startQuiz() {
  if (cards.length === 0) {
    showNotification('Add some cards first!', 'error');
    return;
  }
  
  quizCards = [...cards].sort(() => Math.random() - 0.5);
  quizIndex = 0;
  quizStartTime = Date.now();
  
  quizModal.classList.add('active');
  startQuizTimer();
  loadQuizQuestion();
}

function loadQuizQuestion() {
  if (quizIndex >= quizCards.length) {
    endQuiz();
    return;
  }
  
  currentQuizCard = quizCards[quizIndex];
  questionNumber.textContent = `Question ${quizIndex + 1} of ${quizCards.length}`;
  quizQuestion.textContent = currentQuizCard.q;
  quizAnswer.value = '';
  answerFeedback.className = 'answer-feedback';
  answerFeedback.style.display = 'none';
  
  const progress = ((quizIndex) / quizCards.length) * 100;
  quizProgressBar.style.width = `${progress}%`;
  
  quizAnswer.focus();
}

function submitAnswer() {
  const userAnswer = quizAnswer.value.trim().toLowerCase();
  const correctAnswer = currentQuizCard.a.toLowerCase();
  
  if (!userAnswer) {
    showNotification('Please enter an answer!', 'error');
    return;
  }
  
  questionsAnswered++;
  
  if (userAnswer === correctAnswer || correctAnswer.includes(userAnswer)) {
    score++;
    streak++;
    answerFeedback.className = 'answer-feedback correct';
    answerFeedback.innerHTML = `<i class="fas fa-check-circle"></i> Correct! ${currentQuizCard.a}`;
    
    if (streak % 5 === 0) {
      showAchievement('Streak Master!', `You've answered ${streak} questions correctly in a row!`);
    }
  } else {
    streak = 0;
    answerFeedback.className = 'answer-feedback incorrect';
    answerFeedback.innerHTML = `<i class="fas fa-times-circle"></i> Incorrect! The correct answer is: ${currentQuizCard.a}`;
  }
  
  answerFeedback.style.display = 'block';
  quizScore.textContent = `${score}/${questionsAnswered}`;
  
  saveData();
  updateStats();
  
  setTimeout(() => {
    quizIndex++;
    loadQuizQuestion();
  }, 2000);
}

function showHint() {
  if (!currentQuizCard) return;
  
  const answer = currentQuizCard.a;
  const hintLength = Math.ceil(answer.length / 3);
  const hint = answer.substring(0, hintLength) + '...';
  
  showNotification(`Hint: ${hint}`, 'info');
}

function skipQuestion() {
  questionsAnswered++;
  quizScore.textContent = `${score}/${questionsAnswered}`;
  saveData();
  updateStats();
  
  quizIndex++;
  loadQuizQuestion();
}

function startQuizTimer() {
  let seconds = 0;
  quizTimerInterval = setInterval(() => {
    seconds++;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    quizTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, 1000);
}

function endQuiz() {
  clearInterval(quizTimerInterval);
  const finalScore = Math.round((score / questionsAnswered) * 100);
  
  quizModal.classList.remove('active');
  
  let message = '';
  if (finalScore >= 90) {
    message = 'Outstanding! You\'re a master! 🏆';
  } else if (finalScore >= 70) {
    message = 'Great job! Keep it up! 🌟';
  } else if (finalScore >= 50) {
    message = 'Good effort! Practice more! 💪';
  } else {
    message = 'Keep practicing! You\'ll improve! 📚';
  }
  
  showAchievement('Quiz Complete!', message);
}

function closeQuizModal() {
  if (confirm('Are you sure you want to exit the quiz?')) {
    clearInterval(quizTimerInterval);
    quizModal.classList.remove('active');
  }
}

// ========================
// PRACTICE MODE
// ========================
function startPracticeMode() {
  const unmasteredCards = cards.filter(card => !card.mastered);
  
  if (unmasteredCards.length === 0) {
    showNotification('You\'ve mastered all cards! Add more to practice.', 'success');
    return;
  }
  
  quizCards = unmasteredCards.sort(() => Math.random() - 0.5);
  quizIndex = 0;
  quizStartTime = Date.now();
  
  quizModal.classList.add('active');
  startQuizTimer();
  loadQuizQuestion();
}

// ========================
// IMPORT/EXPORT
// ========================
function exportCards() {
  if (cards.length === 0) {
    showNotification('No cards to export!', 'error');
    return;
  }
  
  const dataStr = JSON.stringify(cards, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `flashcards_${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  
  showNotification('Cards exported successfully!', 'success');
}

function importCards(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedCards = JSON.parse(event.target.result);
      
      if (!Array.isArray(importedCards)) {
        throw new Error('Invalid format');
      }
      
      // Validate and add cards
      importedCards.forEach(card => {
        if (card.q && card.a) {
          cards.push({
            q: card.q,
            a: card.a,
            difficulty: card.difficulty || 'medium',
            category: card.category || 'general',
            mastered: card.mastered || false
          });
        }
      });
      
      saveData();
      renderCards();
      updateStats();
      showNotification(`Imported ${importedCards.length} cards successfully!`, 'success');
      
    } catch (error) {
      showNotification('Invalid file format! Please upload a valid JSON file.', 'error');
    }
  };
  
  reader.readAsText(file);
  e.target.value = '';
}

// ========================
// NOTIFICATIONS
// ========================
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 16px 32px;
    border-radius: 12px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    animation: slideDown 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function showAchievement(title, description) {
  const popup = document.getElementById('achievementPopup');
  const titleEl = document.getElementById('achievementTitle');
  const descEl = document.getElementById('achievementDesc');
  
  titleEl.textContent = title;
  descEl.textContent = description;
  
  popup.classList.add('show');
  
  setTimeout(() => {
    popup.classList.remove('show');
  }, 4000);
}

// ========================
// INITIALIZE APP
// ========================
init();