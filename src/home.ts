interface Lesson {
  id: string;
  title: string;
}

async function loadLessons(): Promise<Lesson[]> {
  try {
    const response = await fetch('/lessons.json');
    return await response.json();
  } catch (error) {
    console.error('Failed to load lessons:', error);
    return [];
  }
}

async function renderLessons() {
  const lessons = await loadLessons();
  const lessonsContainer = document.getElementById('lessons-list');

  if (lessonsContainer && lessons.length > 0) {
    lessonsContainer.innerHTML = lessons
      .map(
        lesson => `
          <div style="margin: 10px 0;">
            <a href="/${lesson.id}.html" style="
              display: inline-block;
              padding: 10px 15px;
              background: #333;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              transition: background-color 0.2s;
            " onmouseover="this.style.backgroundColor='#555'" 
               onmouseout="this.style.backgroundColor='#333'">
              ${lesson.title}
            </a>
          </div>
        `
      )
      .join('');
  } else if (lessonsContainer) {
    lessonsContainer.innerHTML = '<p>No lessons found.</p>';
  }
}

// Load and render lessons when the page loads
renderLessons();