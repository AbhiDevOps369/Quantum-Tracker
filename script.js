// Page Navigation Logic
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.page');
  const nextBtns = document.querySelectorAll('.next-btn');
  const backBtns = document.querySelectorAll('.back-btn');
  let currentIndex = 0;

  function showPage(index) {
    sections.forEach((sec, i) => {
      sec.style.display = i === index ? 'block' : 'none';
    });

    if (index === sections.length - 1) {
      renderSummary(); // Populate summary data
      renderChart();   // Draw summary chart
    }
  }

  nextBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (i < sections.length - 1) {
        currentIndex++;
        showPage(currentIndex);
      }
    });
  });

  backBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        showPage(currentIndex);
      }
    });
  });

  showPage(currentIndex);
});

// Saving responses to localStorage
function saveResponse(sectionId, score) {
  const today = new Date().toISOString().split('T')[0];
  const data = JSON.parse(localStorage.getItem('quantumData') || '{}');

  if (!data[today]) data[today] = {};
  data[today][sectionId] = score;

  localStorage.setItem('quantumData', JSON.stringify(data));
}

// Calculate and save scores for a section
function calculateAndSave(sectionId) {
  const radios = document.querySelectorAll(`#${sectionId} input[type="radio"]:checked`);
  let score = 0;
  radios.forEach(r => score += parseInt(r.value));
  saveResponse(sectionId, score);
}

// Chart.js Visualization
function renderChart() {
  const ctx = document.getElementById('scoreChart').getContext('2d');
  const data = JSON.parse(localStorage.getItem('quantumData') || '{}');
  const labels = Object.keys(data);
  const kingData = labels.map(day => data[day]?.king || 0);
  const warriorData = labels.map(day => data[day]?.warrior || 0);
  const sageData = labels.map(day => data[day]?.sage || 0);
  const scholarData = labels.map(day => data[day]?.scholar || 0);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'King',
          data: kingData,
          borderColor: '#8e44ad',
          fill: false
        },
        {
          label: 'Warrior',
          data: warriorData,
          borderColor: '#e67e22',
          fill: false
        },
        {
          label: 'Sage',
          data: sageData,
          borderColor: '#2ecc71',
          fill: false
        },
        {
          label: 'Scholar',
          data: scholarData,
          borderColor: '#3498db',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Archetype Reflection Scores Over Time'
        }
      }
    }
  });
}

function renderSummary() {
  const data = JSON.parse(localStorage.getItem('quantumData') || '{}');
  const today = new Date().toISOString().split('T')[0];
  const todayScores = data[today] || {};

  const summaryEl = document.getElementById('summary-insight');
  if (!summaryEl) return;

  summaryEl.innerHTML = `
    <h3>Today's Summary</h3>
    <p>King: ${todayScores.king || 0}</p>
    <p>Warrior: ${todayScores.warrior || 0}</p>
    <p>Sage: ${todayScores.sage || 0}</p>
    <p>Scholar: ${todayScores.scholar || 0}</p>
  `;
}