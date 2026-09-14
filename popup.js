const tasks = ['task1', 'task2', 'task3'];

let timerInterval;
let currentMinutes = 25;
let timeLeft = currentMinutes * 60; 

function applyLocalization() {
  const extTitle = document.getElementById('ext-title');
  const startBtn = document.getElementById('start-btn');
  const t1 = document.getElementById('task1');
  const t2 = document.getElementById('task2');
  const t3 = document.getElementById('task3');

  if (extTitle) extTitle.innerText = chrome.i18n.getMessage("title") || "🎯 Tasks";
  if (startBtn) startBtn.innerText = chrome.i18n.getMessage("btnStart") || "Start";
  
  if (t1) t1.placeholder = chrome.i18n.getMessage("task1_place") || "Task 1...";
  if (t2) t2.placeholder = chrome.i18n.getMessage("task2_place") || "Task 2...";
  if (t3) t3.placeholder = chrome.i18n.getMessage("task3_place") || "Task 3...";
}

document.addEventListener('DOMContentLoaded', () => {
  // Загружаем сохраненные задачи и выбранную тему
  chrome.storage.local.get([...tasks, 'darkMode'], (result) => {
    tasks.forEach(id => {
      const el = document.getElementById(id);
      if (el && result[id]) el.value = result[id];
    });

    // Применяем тёмную тему, если она была включена ранее
    if (result['darkMode']) {
      document.body.classList.add('dark-mode');
      document.getElementById('theme-toggle-btn').innerText = '☀️';
    }
  });

  // Отслеживаем ввод и сохраняем изменения задач
  tasks.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', (e) => {
        chrome.storage.local.set({ [id]: e.target.value });
      });
    }
  });

  // Отслеживание изменения поля ввода минут
  const minsInput = document.getElementById('minutes-input');
  if (minsInput) {
    minsInput.addEventListener('input', (e) => {
      if (timerInterval) return;
      
      let val = parseInt(e.target.value) || 25;
      if (val < 1) val = 1;
      if (val > 180) val = 180;
      
      currentMinutes = val;
      timeLeft = currentMinutes * 60;
      updateTimerDisplay();
    });
  }

  // Логика переключения тёмной темы 🌙 / ☀️
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-mode');
      themeBtn.innerText = isDark ? '☀️' : '🌙';
      chrome.storage.local.set({ 'darkMode': isDark });
    });
  }

  applyLocalization();
});

// Кнопка Старт/Пауза
const startBtnEl = document.getElementById('start-btn');
if (startBtnEl) {
  startBtnEl.addEventListener('click', () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      document.getElementById('start-btn').innerText = chrome.i18n.getMessage("btnStart") || "Start";
      document.getElementById('minutes-input').disabled = false;
      return;
    }

    document.getElementById('minutes-input').disabled = true;
    document.getElementById('start-btn').innerText = chrome.i18n.getMessage("btnPause") || "Pause";
    
    timerInterval = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        alert(chrome.i18n.getMessage("alertTime") || "Time to rest!");
        
        timeLeft = currentMinutes * 60;
        updateTimerDisplay();
        document.getElementById('start-btn').innerText = chrome.i18n.getMessage("btnStart") || "Start";
        document.getElementById('minutes-input').disabled = false;
        return;
      }
      timeLeft--;
      updateTimerDisplay();
    }, 1000);
  });
}

// Кнопка сброса 🔄
const resetBtnEl = document.getElementById('reset-btn');
if (resetBtnEl) {
  resetBtnEl.addEventListener('click', () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timeLeft = currentMinutes * 60;
    updateTimerDisplay();
    document.getElementById('minutes-input').disabled = false;
    if (startBtnEl) {
      startBtnEl.innerText = chrome.i18n.getMessage("btnStart") || "Start";
    }
  });
}

function updateTimerDisplay() {
  const timerEl = document.getElementById('timer');
  if (timerEl) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerEl.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
