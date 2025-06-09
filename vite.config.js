import glsl from 'vite-plugin-glsl';
import { resolve } from 'path';
import { generateLessonsJson } from './scripts/generate-lessons.js';

// Generate lessons and get the list
const lessonDirs = generateLessonsJson();

// Build input object for multi-page setup
const input = {
  main: resolve(process.cwd(), 'index.html'),
};

lessonDirs.forEach(lesson => {
  input[lesson] = resolve(process.cwd(), `${lesson}.html`);
});

export default {
    root: './',
    publicDir: './public',
    base: './',

    build: {
      rollupOptions: {
        input,
      },
    },

    optimizeDeps: {
      include: [
        'three',
        'three/addons/controls/OrbitControls.js',
        'three/examples/jsm/libs/stats.module.js'
      ],
    },
    plugins: [
      // restart({ restart: [ '../public/**', ] }), // Restart server on static file change
      glsl() // Handle shader files
    ]
}