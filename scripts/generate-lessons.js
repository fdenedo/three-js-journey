import { readdirSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

function generateLessonsJson() {
  // Ensure public directory exists
  if (!existsSync('./public')) {
    mkdirSync('./public');
  }

  // Automatically discover lesson directories
  const lessonsDir = './src/lessons';
  let lessonDirs = [];

  if (existsSync(lessonsDir)) {
    lessonDirs = readdirSync(lessonsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .sort();
  }

  // Generate lessons data
  const lessonsData = lessonDirs.map(lesson => ({
    id: lesson,
    title: lesson.split('-').slice(1).join(' ').replace(/\b\w/g, l => l.toUpperCase())
  }));

  // Write lessons.json
  writeFileSync(
    './public/lessons.json',
    JSON.stringify(lessonsData, null, 2)
  );

  console.log(`✅ Generated lessons.json with ${lessonsData.length} lessons`);
  return lessonDirs;
}

export { generateLessonsJson };

if (import.meta.url === `file://${process.argv[1]}`) {
  generateLessonsJson();
}