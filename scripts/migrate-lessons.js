import { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

async function migrateLessons() {
  const lessonsDir = './lessons';
  
  if (!existsSync(lessonsDir)) {
    console.log(chalk.red('❌ No lessons directory found!'));
    return;
  }

  // Discover lesson directories
  const lessonDirs = readdirSync(lessonsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort();

  if (lessonDirs.length === 0) {
    console.log(chalk.yellow('⚠️  No lesson directories found!'));
    return;
  }

  console.log(chalk.blue(`📚 Found ${lessonDirs.length} lessons to migrate:`));
  lessonDirs.forEach(lesson => {
    console.log(chalk.gray(`  • ${lesson}`));
  });

  // Ask for confirmation
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Do you want to migrate these lessons?',
      default: false
    }
  ]);

  if (!confirm) {
    console.log(chalk.yellow('🚫 Migration cancelled'));
    return;
  }

  const spinner = ora('Migrating lessons...').start();
  const results = {
    migrated: [],
    skipped: [],
    errors: []
  };

  for (const lesson of lessonDirs) {
    try {
      const sourcePath = join(lessonsDir, lesson, 'index.html');
      const targetPath = `${lesson}.html`;

      // Check if source file exists
      if (!existsSync(sourcePath)) {
        results.skipped.push(`${lesson} (no index.html found)`);
        continue;
      }

      // Check if target already exists
      if (existsSync(targetPath)) {
        results.skipped.push(`${lesson} (${targetPath} already exists)`);
        continue;
      }

      // Read and update the HTML content
      let htmlContent = readFileSync(sourcePath, 'utf-8');
      
      // Update script src path to point to the lesson directory
      htmlContent = htmlContent.replace(
        /src="\.\/main\.ts"/g,
        `src="./lessons/${lesson}/main.ts"`
      );

      // Update any relative CSS links if they exist
      htmlContent = htmlContent.replace(
        /href="src\/style\.css"/g,
        'href="./src/style.css"'
      );

      // Update title if it's generic
      if (htmlContent.includes('<title>Three.js Journey</title>')) {
        const title = lesson.split('-').slice(1).join(' ').replace(/\b\w/g, l => l.toUpperCase());
        htmlContent = htmlContent.replace(
          '<title>Three.js Journey</title>',
          `<title>Lesson ${lesson.split('-')[0]} - ${title}</title>`
        );
      }

      // Write the new file
      writeFileSync(targetPath, htmlContent);
      
      // Remove the old file
      unlinkSync(sourcePath);
      
      results.migrated.push(lesson);
      
    } catch (error) {
      results.errors.push(`${lesson}: ${error.message}`);
    }
  }

  spinner.stop();

  // Report results
  console.log('\n' + chalk.green('✅ Migration completed!'));
  
  if (results.migrated.length > 0) {
    console.log(chalk.green(`\n📦 Successfully migrated ${results.migrated.length} lessons:`));
    results.migrated.forEach(lesson => {
      console.log(chalk.green(`  ✓ ${lesson}.html`));
    });
  }

  if (results.skipped.length > 0) {
    console.log(chalk.yellow(`\n⏭️  Skipped ${results.skipped.length} lessons:`));
    results.skipped.forEach(item => {
      console.log(chalk.yellow(`  - ${item}`));
    });
  }

  if (results.errors.length > 0) {
    console.log(chalk.red(`\n❌ Errors (${results.errors.length}):`));
    results.errors.forEach(error => {
      console.log(chalk.red(`  × ${error}`));
    });
  }

  console.log(chalk.blue('\n🔄 Next steps:'));
  console.log(chalk.gray('  1. Update your vite.config.js to use the new structure'));
  console.log(chalk.gray('  2. Update src/home.ts to link to .html files'));
  console.log(chalk.gray('  3. Restart your dev server'));
}

// Export for use in other files
export { migrateLessons };

console.log(import.meta.url === `file:\\${process.argv[1]}`)

// Run if called directly
migrateLessons().catch(console.error);