const buttons = document.querySelectorAll('.button');
const timerDisplay = document.querySelector('.timer');
const startButton = document.querySelector('.start-button');
const resetButton = document.querySelector('.reset-button');
const resetIcon = document.querySelector('.reset-icon');
const quotesText = document.querySelector('.quotes');
const quotesAuthor = document.querySelector('.author');
const settingsButton = document.querySelector('.settings-button');
const settingsBox = document.querySelector('.settingsBox');

let selectedMode = 'pomodoro';
let timerInterval;
let isRunning = false;

const durations = {
  'pomodoro': 25 * 60,
  'short break': 5 * 60,
  'long break': 10 * 60
};

let timeLeft = durations[selectedMode];
document.title = `⋆ ˚｡⋆୨୧˚ ${timeLeft}s`;

buttons.forEach(button => {
  button.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('selected'));
    button.classList.add('selected');
    selectedMode = button.textContent.toLowerCase();
    resetTimer();
  });
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  startButton.textContent = 'start';
  timeLeft = durations[selectedMode];
  timerDisplay.textContent = formatTime(timeLeft);
  document.title = `ₓ˚. ୭ ˚○◦˚ ${formatTime(timeLeft)} ˚◦○˚ ୧ .˚ₓ `;
}

startButton.addEventListener('click', () => {
  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    startButton.textContent = 'start';
  } else {
    isRunning = true;
    startButton.textContent = 'stop';

    timerInterval = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerDisplay.textContent = "00:00";
        document.title = "Time Left: 00:00";
        isRunning = false;
        startButton.textContent = 'start';
      } else {
        timeLeft--;
        const formatted = formatTime(timeLeft);
        timerDisplay.textContent = formatted;
        document.title = `Time Left: ${formatted}`;
      }
    }, 1000);
  }
});

resetButton.addEventListener('click', () => {
  resetButton.classList.add('spin');
  setTimeout(() => {
    resetButton.classList.remove('spin');
  }, 600);
  resetTimer();
});

resetTimer();

const apiUrl = 'https://api.realinspire.live/v1/quotes/random?maxLength=55';

function getQuotes() {
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const { content, author } = data[0];
        quotesText.textContent = `"${content}"`;
        quotesAuthor.textContent = `- ${author}`;
      } else {
        console.error('No data found in API response.');
      }
    })
    .catch(error => {
      console.error('Error fetching quote:', error);
    });
}

getQuotes();

// ==== Settings ====
const backgroundsFolder = 'assets/backgrounds/';
const backgroundImages = [
  'city.jpg',
  'cathedral.jpg',
  'mountains.jpg',
  'mclaren.jpg',
  'venice.jpg'
];

let isSettingsOpen = false;
let positionSlider;

function updateBackgroundPosition() {
  const url = document.body.style.backgroundImage;
  const match = url.match(/\/([^\/]+\.jpg)/);
  if (match) {
    const filename = match[1];
    localStorage.setItem(`bg-pos-${filename}`, positionSlider.value);
  }
  document.body.style.backgroundPosition = `center ${positionSlider.value}%`;
}


function createBackgroundSelector() {
  const title = document.createElement('h2');
  title.textContent = 'Choose a Background';
  title.style.fontFamily = 'Space Grotesk';
  title.style.color = 'black';
  title.style.marginTop = '20px';

  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
  grid.style.gap = '15px';
  grid.style.padding = '20px';

  backgroundImages.forEach(filename => {
    const img = document.createElement('img');
    img.src = `${backgroundsFolder}${filename}`;
    img.alt = filename;
    img.style.width = '100%';
    img.style.borderRadius = '10px';
    img.style.cursor = 'pointer';
    img.style.border = '2px solid transparent';
    img.style.transition = 'transform 0.2s ease';

    img.addEventListener('click', () => {
  const bgUrl = `${backgroundsFolder}${filename}`;
  document.body.style.backgroundImage = `url(${bgUrl})`;
  document.body.style.backgroundRepeat = 'no-repeat';
  document.body.style.backgroundSize = 'cover';

  // Save selected wallpaper
  localStorage.setItem('selected-background', filename);

  // Load saved vertical position if exists
  const savedPos = localStorage.getItem(`bg-pos-${filename}`);
  positionSlider.value = savedPos || '50';
  updateBackgroundPosition();
});


    img.addEventListener('mouseover', () => {
      img.style.border = '2px solid white';
    });

    img.addEventListener('mouseout', () => {
      img.style.border = '2px solid transparent';
    });

    grid.appendChild(img);
  });

  const positionLabel = document.createElement('label');
  positionLabel.textContent = 'Vertical Position (%)';
  positionLabel.style.fontFamily = 'Space Grotesk';
  positionLabel.style.fontWeight = 'bold';
  positionLabel.style.marginTop = '10px';
  positionLabel.style.display = 'block';

  positionSlider = document.createElement('input');
  positionSlider.type = 'range';
  positionSlider.min = '0';
  positionSlider.max = '100';
  positionSlider.value = '50';
  positionSlider.style.width = '80%';

  positionSlider.addEventListener('input', updateBackgroundPosition);

  settingsBox.appendChild(title);
  settingsBox.appendChild(grid);
  settingsBox.appendChild(positionLabel);
  settingsBox.appendChild(positionSlider);
}

function toggleSettingsBox() {
  isSettingsOpen = !isSettingsOpen;
  if (isSettingsOpen) {
    settingsBox.classList.add('visible');
    if (settingsBox.innerHTML.trim() === '') {
      createBackgroundSelector();
    }
  } else {
    settingsBox.classList.remove('visible');
  }
}


settingsButton.addEventListener('click', toggleSettingsBox);
