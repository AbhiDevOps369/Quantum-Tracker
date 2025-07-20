// ======================
// CORE TRACKING SYSTEM
// ======================
document.addEventListener('DOMContentLoaded', function() {
  // Initialize pages
  const pages = document.querySelectorAll('.page');
  let currentPage = 0;
  
  // Navigation handlers
  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', handleNext);
  });
  
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', goBack);
  });

  // Show first page
  showPage(currentPage);
});

// ======================
// SECTION CONFIGURATION
// ======================
const sections = {
  offday: {
    questions: ['off-day'],
    maxScore: 1
  },
  discipline: {
    questions: ['todo', 'nottodo', 'routine-morning', 'routine-night'],
    maxScore: 4,
    specialType: 'discipline'
  },
  wisdom: {
    questions: ['book1-action', 'book2-action'],
    maxScore: 2
  },
  skills: {
    questions: ['skill1', 'skill2', 'skill3'],
    isSelect: true
  },
  ratings: {
    questions: ['rating-mood', 'rating-productivity', 'rating-health', 'rating-focus', 'rating-sleep'],
    maxScore: 25,
    isStars: true
  },
  reflection: {
    questions: ['grat', 'dist'],
    maxScore: 2
  },
  archetype: {
    subgroups: {
      king: ['king-q1', 'king-q2'],
      warrior: ['warrior-q1', 'warrior-q3'],
      sage: ['sage-q1', 'sage-q5'],
      scholar: ['scholar-q2', 'scholar-q3']
    },
    maxScore: 2
  }
};

// ======================
// DATA MANAGEMENT
// ======================
function saveSectionData(sectionId) {
  const today = new Date().toISOString().split('T')[0];
  let data = JSON.parse(localStorage.getItem('trackerData') || '{}');
  
  if (!data[today]) data[today] = {};
  
  if (sectionId === 'archetype') {
    data[today].archetype = calculateArchetypeScores();
  } else {
    const section = sections[sectionId];
    data[today][sectionId] = section.isSelect ? 
      getSelectValues(section.questions) : 
      calculateScore(section.questions, section.maxScore);
  }
  
  localStorage.setItem('trackerData', JSON.stringify(data));
}

function calculateScore(questionNames, maxScore) {
  let score = 0;
  questionNames.forEach(name => {
    const selectedRadio = document.querySelector(`input[name="${name}"]:checked`);
    const selectedCheckbox = document.querySelector(`input[id="${name}"]:checked`);
    
    if (selectedRadio) {
      score += parseInt(selectedRadio.value);
    } else if (selectedCheckbox) {
      score += 1;
    }
  });
  return { score, maxScore, percentage: Math.round((score / maxScore) * 100) };
}

function calculateArchetypeScores() {
  const results = {};
  for (const [group, questions] of Object.entries(sections.archetype.subgroups)) {
    results[group] = calculateScore(questions, sections.archetype.maxScore);
  }
  return results;
}

function getSelectValues(selectNames) {
  const values = {};
  selectNames.forEach(name => {
    values[name] = document.getElementById(name).value;
  });
  return values;
}

// ======================
// NAVIGATION & UI
// ======================
function handleNext(e) {
  const sectionId = e.target.dataset.section || 
                   e.target.closest('.next-btn').dataset.section;
  
  if (sectionId) saveSectionData(sectionId);
  showPage(currentPage + 1);
}

function goBack() {
  showPage(currentPage - 1);
}

function showPage(index) {
  const pages = document.querySelectorAll('.page');
  pages.forEach((page, i) => {
    page.style.display = i === index ? 'block' : 'none';
  });
  currentPage = index;
  
  // Show appropriate summary
  const currentPageId = pages[index].id;
  if (currentPageId === 'summary-insight') {
    renderSummary();
  } else {
    renderSectionSummary(currentPageId);
  }
}

// ======================
// SECTION SUMMARIES
// ======================
function renderSectionSummary(pageId) {
  const today = new Date().toISOString().split('T')[0];
  const data = JSON.parse(localStorage.getItem('trackerData') || {})[today] || {};
  
  switch(pageId) {
    // case 'page-2': // Daily Discipline
    //   renderDisciplineSummary(data.discipline || {});
    //   break;
      
    // case 'page-5': // Ratings
    //   renderStarsSummary(data.ratings || {});
    //   break;
      
    // case 'page-6': // Reflection
    //   renderReflectionSummary(data.reflection || {});
    //   break;
      
    // case 'page-7': // Archetypes
    //   renderArchetypeChart(data.archetype || {});
    //   break;
  }
}

function renderDisciplineSummary(discipline) {
  const container = document.getElementById('page2-summary-text') || createSummaryContainer('page2');
  container.innerHTML = `
    <p>To-Do List: ${discipline.todo === 'yes' ? '✅' : '❌'}</p>
    <p>Not-To-Do List: ${discipline.nottodo === 'yes' ? '✅' : '❌'}</p>
    <p>Morning Routine: ${discipline['routine-morning'] ? '✅' : '❌'}</p>
    <p>Night Routine: ${discipline['routine-night'] ? '✅' : '❌'}</p>
    <p>Score: ${discipline.score || 0}/4</p>
  `;
}

function renderStarsSummary(ratings) {
  const container = document.getElementById('page5-summary-text') || createSummaryContainer('page5');
  container.innerHTML = `
    <p>Mood: ${getStarIcons(ratings['rating-mood'])}</p>
    <p>Productivity: ${getStarIcons(ratings['rating-productivity'])}</p>
    <p>Health: ${getStarIcons(ratings['rating-health'])}</p>
    <p>Focus: ${getStarIcons(ratings['rating-focus'])}</p>
    <p>Sleep: ${getStarIcons(ratings['rating-sleep'])}</p>
  `;
}

function renderReflectionSummary(reflection) {
  const container = document.getElementById('page6-summary-text') || createSummaryContainer('page6');
  container.innerHTML = `
    <p>Delayed Gratification: ${reflection.grat === '1' ? '✅' : '❌'}</p>
    <p>Overcame Distractions: ${reflection.dist === '1' ? '✅' : '❌'}</p>
    <p>Score: ${reflection.score || 0}/2</p>
  `;
}

function renderArchetypeChart(archetypes) {
  const container = document.getElementById('page7-summary') || createSummaryContainer('page7');
  container.innerHTML = `
    <canvas id="archetypeChart"></canvas>
    <div id="archetype-scores"></div>
  `;
  
  // Prepare data
  const labels = [];
  const scores = [];
  const colors = ['#8e44ad', '#e67e22', '#2ecc71', '#3498db'];
  
  let html = '<div class="archetype-scores">';
  let i = 0;
  for (const [type, score] of Object.entries(archetypes)) {
    labels.push(type.charAt(0).toUpperCase() + type.slice(1));
    scores.push(score.percentage);
    html += `<p style="color: ${colors[i]}">${type}: ${score.score}/${score.maxScore}</p>`;
    i++;
  }
  html += '</div>';
  
  document.getElementById('archetype-scores').innerHTML = html;
  
  
  // Render chart
  const ctx = document.getElementById('archetypeChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Performance (%)',
        data: scores,
        backgroundColor: colors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

// ======================
// HELPER FUNCTIONS
// ======================
function createSummaryContainer(pageId) {
  const card = document.createElement('div');
  card.className = 'DailyCard summary-card';
  card.id = `${pageId}-summary`;
  card.innerHTML = `<h4>Summary</h4><div id="${pageId}-summary-text"></div>`;
  document.getElementById(pageId).appendChild(card);
  return document.getElementById(`${pageId}-summary-text`);
}

function getStarIcons(rating) {
  if (!rating) return 'Not rated';
  const filled = '★'.repeat(rating);
  const empty = '☆'.repeat(5 - rating);
  return `<span class="star-rating">${filled}${empty}</span> (${rating}/5)`;
}

// ======================
// MAIN SUMMARY PAGE
// ======================
function renderSummary() {
  const today = new Date().toISOString().split('T')[0];
  const data = JSON.parse(localStorage.getItem('trackerData') || {})[today] || {};
  
  renderSummaryChart(data);
  renderSummaryText(data);
}

function renderSummaryChart(data) {
  const ctx = document.getElementById('summaryChart').getContext('2d');
  
  // Prepare dataset
  const labels = [];
  const scores = [];
  const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];
  
  Object.entries(data).forEach(([section, value], i) => {
    if (section === 'archetype') return;
    labels.push(section.charAt(0).toUpperCase() + section.slice(1));
    scores.push(value.percentage || 0);
  });
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Daily Scores',
        data: scores,
        backgroundColor: colors
      }]
    },
    options: {
      scales: {
        y: { 
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

function renderSummaryText(data) {
  let html = '<h3>Daily Summary</h3>';
  
  // Main sections
  for (const [section, value] of Object.entries(data)) {
    if (section === 'archetype' || section === 'skills' || section === 'wisdom') continue;
    html += `
      <div class="summary-item">
        <h4>${section.charAt(0).toUpperCase() + section.slice(1)}</h4>
        <p>Score: ${value.score || 'N/A'}/${value.maxScore || '--'} (${value.percentage || '0'}%)</p>
      </div>
    `;
  }

  // Skills and Books Details
  if (data.skills) {
    const nonEmptySkills = Object.entries(data.skills).filter(([_, v]) => v && v.trim() !== '');
    if (nonEmptySkills.length > 0) {
      html += '<h4>Skills Practiced</h4><ul>';
      for (const [key, value] of nonEmptySkills) {
        html += `<li>${value}</li>`;
      }
      html += '</ul>';
    }
  }
  
  // Archetype sub-scores
  if (data.archetype) {
    html += '<h4>Archetype Performance</h4>';
    for (const [archetype, score] of Object.entries(data.archetype)) {
      html += `<p>${archetype}: ${score.score}/${score.maxScore}</p>`;
    }
  }
  
  document.getElementById('summaryText').innerHTML = html;
}