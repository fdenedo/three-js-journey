#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import inquirer from 'inquirer';
import ora from 'ora';

// Configuration
const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'exr', 'hdr', 'webp'];
const TEXTURE_TYPES = {
    diffuse: ['diffuse', 'diff', 'color', 'albedo', 'base'],
    normal: ['normal', 'norm', 'nor'],
    roughness: ['roughness', 'rough'],
    metallic: ['metallic', 'metal'],
    ao: ['ao', 'ambient', 'occlusion'],
    displacement: ['displacement', 'disp', 'height'],
    arm: ['arm'], // Combined AO, Roughness, Metallic
    alpha: ['alpha', 'opacity']
};

const COLOR_SPACE_TEXTURES = ['diffuse', 'diff', 'color', 'albedo', 'base'];

// CLI Setup
const argv = yargs(hideBin(process.argv))
    .option('directory', {
        alias: 'd',
        type: 'string',
        description: 'Directory containing textures'
    })
    .option('prefix', {
        alias: 'p', 
        type: 'string',
        description: 'Prefix for texture variable names'
    })
    .option('output', {
        alias: 'o',
        type: 'string', 
        description: 'Output file path',
        default: './generated/generated-textures.ts'
    })
    .option('force', {
        alias: 'f',
        type: 'boolean',
        description: 'Overwrite existing files without confirmation',
        default: false
    })
    .option('preview', {
        type: 'boolean',
        description: 'Show preview without writing file',
        default: false
    })
    .example('$0 -d ./textures/wood -p wood', 'Generate wood texture imports')
    .example('$0 -d ./textures/stone -p stone -o ./materials/stone.ts', 'Custom output path')
    .example('$0 --preview -d ./textures/metal -p metal', 'Preview without writing')
    .help()
    .argv;

console.log(chalk.bold.blue('🎨 Three.js Texture Import Generator'));
console.log(chalk.gray('   Automatically generates TypeScript imports for texture files\n'));
main();

async function main() {
    try {
        console.log(chalk.blue('🚀 Starting texture import generation...\n'));
        
        const config = await getConfiguration();
        const files = await scanTextureFiles(config.directory);
        const categorizedTextures = categorizeTextures(files, config.directory);
        
        // Check if we have any textures to generate
        if (Object.keys(categorizedTextures).length === 0) {
            console.log(chalk.yellow('\n⚠️  No recognized textures found. Nothing to generate.'));
            console.log(chalk.gray('💡 Try renaming files to include keywords like: diffuse, normal, roughness, etc.'));
            return;
        }
        
        // Show generation summary and ask for confirmation
        const shouldProceed = await showGenerationSummary(categorizedTextures, config);
        if (!shouldProceed) {
            console.log(chalk.yellow('\n❌ Generation cancelled by user.'));
            return;
        }
        
        const generatedCode = await generateTextureCode(categorizedTextures, config);
        
        // Preview mode - don't write file
        if (argv.preview) {
            console.log(chalk.green.bold('\n👀 Preview mode - no file written.'));
            console.log(chalk.gray('Use without --preview flag to generate the actual file.'));
            return;
        }
        
        // Check for existing file
        const shouldWrite = await checkOverwritePermission(config.output);
        if (!shouldWrite) {
            console.log(chalk.yellow('\n❌ File write cancelled.'));
            return;
        }
        
        await writeOutputFile(generatedCode, config.output);
        await showSuccessMessage(config, categorizedTextures);
        
    } catch (error) {
        console.error(chalk.red.bold('\n❌ Error:'), error.message);
        console.log(chalk.gray('\n💡 Use --help for usage information.'));
        process.exit(1);
    }
}

async function getConfiguration() {
    const config = {};
    
    // Get directory
    if (argv.directory) {
        config.directory = argv.directory;
        console.log(chalk.yellow(`📁 Using provided directory: ${config.directory}`));
        
        // Validate the provided directory
        const validation = validateDirectory(config.directory);
        if (validation !== true) {
            throw new Error(`Invalid directory: ${validation}`);
        }
    } else {
        console.log(chalk.cyan('🤔 No directory provided, asking interactively...'));
        
        const { directory } = await inquirer.prompt([{
            type: 'input',
            name: 'directory',
            message: 'Enter texture directory path:',
            default: './public/textures',
            validate: validateDirectory
        }]);
        config.directory = directory;
    }
    
    // Get prefix
    if (argv.prefix) {
        config.prefix = argv.prefix;
        console.log(chalk.yellow(`🏷️  Using provided prefix: ${config.prefix}`));
        
        // Validate the provided prefix
        const validation = validatePrefix(config.prefix);
        if (validation !== true) {
            throw new Error(`Invalid prefix: ${validation}`);
        }
    } else {
        console.log(chalk.cyan('🤔 No prefix provided, asking interactively...'));
        
        const { prefix } = await inquirer.prompt([{
            type: 'input',
            name: 'prefix',
            message: 'Enter prefix for texture variables:',
            default: path.basename(config.directory),
            validate: validatePrefix
        }]);
        config.prefix = prefix;
    }

    // Get output path
    config.output = argv.output;
    console.log(chalk.yellow(`📄 Output file: ${config.output}`));
    
    return config;
}

function validateDirectory(dirPath) {
    if (!dirPath || dirPath.trim() === '') {
        return 'Directory path cannot be empty';
    }
    
    if (!fs.existsSync(dirPath)) {
        return `Directory does not exist: ${dirPath}\n   💡 Tip: Use relative paths like ./public/textures or absolute paths`;
    }
    
    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) {
        return `Path is not a directory: ${dirPath}`;
    }
    
    // Check if directory is readable
    try {
        const files = fs.readdirSync(dirPath);
        const textureFiles = files.filter(file => {
            const ext = path.extname(file).slice(1).toLowerCase();
            return SUPPORTED_EXTENSIONS.includes(ext);
        });
        
        if (textureFiles.length === 0) {
            return `No supported texture files found in: ${dirPath}\n   💡 Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}`;
        }
    } catch (error) {
        return `Cannot read directory: ${error.message}`;
    }
    
    return true;
}

function validatePrefix(prefix) {
    if (!prefix || prefix.trim() === '') {
        return 'Prefix cannot be empty';
    }
    
    // Check if it's a valid JavaScript identifier
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(prefix)) {
        return 'Prefix must be a valid JavaScript identifier (letters, numbers, underscore, $)';
    }
    
    return true;
}

async function scanTextureFiles(directory) {
    const spinner = ora('🔍 Scanning for texture files...').start();
    
    try {
        // Read all files in directory
        const allFiles = fs.readdirSync(directory);
        
        // Filter for supported texture files
        const textureFiles = allFiles.filter(file => {
            const ext = path.extname(file).slice(1).toLowerCase();
            return SUPPORTED_EXTENSIONS.includes(ext);
        });
        
        // Check if we found any files
        if (textureFiles.length === 0) {
            spinner.fail('No supported texture files found');
            throw new Error(`No texture files found in: ${directory}\nSupported formats: ${SUPPORTED_EXTENSIONS.join(', ')}`);
        }
        
        spinner.succeed(`Found ${textureFiles.length} texture file(s)`);
        
        // Display found files with details
        console.log(chalk.gray('\n📋 Detected files:'));
        textureFiles.forEach(file => {
            const ext = path.extname(file).slice(1).toUpperCase();
            const size = getFileSize(path.join(directory, file));
            console.log(chalk.gray(`  📄 ${file} ${chalk.dim(`(${ext}, ${size})`)}`));
        });
        
        // Show some stats
        console.log(chalk.blue(`\n📊 Summary:`));
        console.log(chalk.blue(`  • Total files: ${textureFiles.length}`));
        console.log(chalk.blue(`  • Extensions found: ${getUniqueExtensions(textureFiles).join(', ')}`));
        
        return textureFiles;
        
    } catch (error) {
        spinner.fail('Failed to scan directory');
        throw error;
    }
}

function categorizeTextures(files, directory) {
    console.log(chalk.blue('\n🔍 Categorizing texture types...'));
    
    const categorized = {};
    const unrecognized = [];
    
    // Try to categorize each file
    files.forEach(file => {
        const type = detectTextureType(file);
        if (type) {
            if (categorized[type]) {
                console.log(chalk.yellow(`⚠️  Multiple ${type} textures found: ${categorized[type]} and ${file}`));
                console.log(chalk.yellow(`   Using: ${file} (more recent)`));
            }
            categorized[type] = file;
        } else {
            unrecognized.push(file);
        }
    });
    
    // Display categorization results
    displayCategorizationResults(categorized, unrecognized, directory);
    
    return categorized;
}

function detectTextureType(filename) {
    const name = filename.toLowerCase();
    
    // Remove common prefixes and suffixes to focus on the texture type
    const cleanName = name
        .replace(/\.(jpg|jpeg|png|exr|hdr|webp)$/, '') // Remove extension
        .replace(/_\d+k$/, ''); // Remove size suffix like _1k, _2k
    
    // Check each texture type
    for (const [type, keywords] of Object.entries(TEXTURE_TYPES)) {
        for (const keyword of keywords) {
            if (cleanName.includes(keyword)) {
                return type;
            }
        }
    }
    
    return null; // Unrecognized
}

function displayCategorizationResults(categorized, unrecognized, directory) {
    console.log(chalk.blue('\n📋 Texture categorization:'));
    
    // Show categorized textures
    const foundTypes = Object.keys(categorized);
    if (foundTypes.length > 0) {
        console.log(chalk.green('\n✅ Recognized textures:'));
        Object.entries(categorized).forEach(([type, filename]) => {
            const needsSRGB = COLOR_SPACE_TEXTURES.some(colorType => 
                TEXTURE_TYPES[type]?.includes(colorType)
            );
            const colorSpaceNote = needsSRGB ? chalk.cyan(' (will use sRGB)') : '';
            const size = getFileSize(path.join(directory, filename));
            
            console.log(chalk.green(`  🎨 ${type.padEnd(12)} → ${filename}${colorSpaceNote} ${chalk.dim(`(${size})`)}`));
        });
    }
    
    // Show unrecognized files
    if (unrecognized.length > 0) {
        console.log(chalk.yellow('\n❓ Unrecognized textures:'));
        unrecognized.forEach(filename => {
            const size = getFileSize(path.join(directory, filename));
            console.log(chalk.yellow(`  ❔ ${filename} ${chalk.dim(`(${size})`)}`));
        });
        
        console.log(chalk.gray('\n💡 Tip: These files will be ignored. Rename them to include keywords like:'));
        console.log(chalk.gray('   diffuse, normal, roughness, metallic, ao, displacement, etc.'));
    }
    
    // Show summary
    console.log(chalk.blue('\n📊 Summary:'));
    console.log(chalk.blue(`  • Recognized: ${foundTypes.length} texture(s)`));
    console.log(chalk.blue(`  • Unrecognized: ${unrecognized.length} file(s)`));
    console.log(chalk.blue(`  • Types found: ${foundTypes.join(', ') || 'none'}`));
    
    // Show what will be generated
    if (foundTypes.length > 0) {
        console.log(chalk.green('\n🚀 Ready to generate:'));
        foundTypes.forEach(type => {
            console.log(chalk.green(`  • ${type}Texture variable`));
        });
        console.log(chalk.green(`  • Complete material setup`));
    }
}

async function showGenerationSummary(categorizedTextures, config) {
    console.log(chalk.blue('\n📋 Generation Summary:'));
    console.log(chalk.blue('─'.repeat(50)));
    
    console.log(chalk.white(`📁 Source: ${config.directory}`));
    console.log(chalk.white(`🏷️  Prefix: ${config.prefix}`));
    console.log(chalk.white(`📄 Output: ${config.output}`));
    console.log(chalk.white(`🎨 Textures: ${Object.keys(categorizedTextures).length} types`));
    
    console.log(chalk.blue('\n🔧 Will generate:'));
    Object.keys(categorizedTextures).forEach(type => {
        const varName = `${config.prefix}${capitalize(type)}Texture`;
        console.log(chalk.green(`  ✓ ${varName}`));
    });
    console.log(chalk.green(`  ✓ ${config.prefix}Material`));
    console.log(chalk.green(`  ✓ configure${capitalize(config.prefix)}Textures()`));
    
    // Don't ask for confirmation if force flag is used
    if (argv.force || argv.preview) {
        return true;
    }
    
    console.log(''); // Empty line
    const { proceed } = await inquirer.prompt([{
        type: 'confirm',
        name: 'proceed',
        message: chalk.cyan('Proceed with generation?'),
        default: true
    }]);
    
    return proceed;
}

async function checkOverwritePermission(outputPath) {
    // Don't check if force flag is used
    if (argv.force) {
        return true;
    }
    
    // Check if file exists
    if (!fs.existsSync(outputPath)) {
        return true; // File doesn't exist, safe to write
    }
    
    console.log(chalk.yellow(`\n⚠️  File already exists: ${outputPath}`));
    
    const stats = fs.statSync(outputPath);
    console.log(chalk.gray(`   Last modified: ${stats.mtime.toLocaleString()}`));
    console.log(chalk.gray(`   Size: ${getFileSizeFromBytes(stats.size)}`));
    
    const { overwrite } = await inquirer.prompt([{
        type: 'confirm',
        name: 'overwrite',
        message: chalk.yellow('Overwrite existing file?'),
        default: false
    }]);
    
    return overwrite;
}

async function showSuccessMessage(config, categorizedTextures) {
    console.log(chalk.green.bold('\n🎉 Success! Texture imports generated.'));
    
    // Show what was created
    console.log(chalk.green('\n✅ Generated exports:'));
    Object.keys(categorizedTextures).forEach(type => {
        const varName = `${config.prefix}${capitalize(type)}Texture`;
        console.log(chalk.green(`   export const ${varName}`));
    });
    console.log(chalk.green(`   export const ${config.prefix}Material`));
    console.log(chalk.green(`   export function configure${capitalize(config.prefix)}Textures()`));
    
    // Show usage example
    console.log(chalk.blue('\n📚 Usage example:'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.white("import * as THREE from 'three';"));
    console.log(chalk.white(`import { ${config.prefix}Material, configure${capitalize(config.prefix)}Textures } from '${getImportPath(config.output)}';`));
    console.log(chalk.white(''));
    console.log(chalk.white('// Configure textures (optional)'));
    console.log(chalk.white(`configure${capitalize(config.prefix)}Textures({ x: 8, y: 8 });`));
    console.log(chalk.white(''));
    console.log(chalk.white('// Use the material'));
    console.log(chalk.white(`const mesh = new THREE.Mesh(geometry, ${config.prefix}Material);`));
    console.log(chalk.gray('─'.repeat(60)));
    
    // Show next steps
    console.log(chalk.blue('\n🚀 Next steps:'));
    console.log(chalk.gray(`   1. Import the generated file in your Three.js code`));
    console.log(chalk.gray(`   2. Use ${config.prefix}Material on your meshes`));
    console.log(chalk.gray(`   3. Optionally configure texture repeat settings`));
    
    // Performance tips
    if (Object.keys(categorizedTextures).length > 3) {
        console.log(chalk.yellow('\n💡 Performance tip:'));
        console.log(chalk.gray('   Consider texture atlasing for better performance with many textures.'));
    }
}

function getImportPath(outputPath) {
    // Convert file path to import path (remove extension, make relative)
    const withoutExt = outputPath.replace(/\.ts$/, '');
    return withoutExt.startsWith('./') ? withoutExt : './' + withoutExt;
}

async function generateTextureCode(categorizedTextures, config) {
    const spinner = ora('🔨 Generating TypeScript code...').start();
    
    try {
        const { prefix, directory, output } = config;
        const lines = [];
        
        // Header with metadata
        lines.push('// Auto-generated texture imports');
        lines.push(`// Generated on: ${new Date().toISOString()}`);
        lines.push(`// Source directory: ${directory}`);
        lines.push(`// Prefix: ${prefix}`);
        lines.push('');
        lines.push("import * as THREE from 'three';");
        lines.push('');
        lines.push('const textureLoader = new THREE.TextureLoader();');
        lines.push('');
        
        // Generate texture loading
        lines.push(`// ${prefix} textures`);
        const textureVars = [];
        Object.entries(categorizedTextures).forEach(([type, filename]) => {
            const varName = `${prefix}${capitalize(type)}Texture`;
            const relativePath = getRelativePath(directory, output, filename);
            
            lines.push(`export const ${varName} = textureLoader.load('${relativePath}');`);
            
            // Set color space for color textures
            if (needsSRGBColorSpace(type)) {
                lines.push(`${varName}.colorSpace = THREE.SRGBColorSpace;`);
            }
            
            textureVars.push({ varName, type });
        });
        
        lines.push('');
        
        // Generate material setup
        lines.push(`// ${prefix} material`);
        lines.push(`export const ${prefix}Material = new THREE.MeshStandardMaterial({`);
        
        const materialProps = [];
        textureVars.forEach(({ varName, type }) => {
            const materialProp = getMaterialProperty(type);
            if (materialProp) {
                materialProps.push(`  ${materialProp}: ${varName}`);
            }
        });
        
        if (materialProps.length > 0) {
            lines.push(materialProps.join(',\n'));
        }
        lines.push('});');
        lines.push('');
        
        // Add texture configuration helper
        lines.push(`// Configure ${prefix} texture settings`);
        lines.push(`export function configure${capitalize(prefix)}Textures(repeat = { x: 1, y: 1 }) {`);
        textureVars.forEach(({ varName }) => {
            lines.push(`  ${varName}.repeat.set(repeat.x, repeat.y);`);
            lines.push(`  ${varName}.wrapS = THREE.RepeatWrapping;`);
            lines.push(`  ${varName}.wrapT = THREE.RepeatWrapping;`);
        });
        lines.push('}');
        
        const code = lines.join('\n');
        
        spinner.succeed('Code generated successfully');
        
        // Show preview
        console.log(chalk.blue('\n📝 Generated code preview:'));
        console.log(chalk.gray('─'.repeat(60)));
        console.log(code);
        console.log(chalk.gray('─'.repeat(60)));
        
        return code;
        
    } catch (error) {
        spinner.fail('Failed to generate code');
        throw error;
    }
}

async function writeOutputFile(code, outputPath) {
    const spinner = ora(`💾 Writing to ${outputPath}...`).start();
    
    try {
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            console.log(chalk.blue(`📁 Created directory: ${outputDir}`));
        }
        
        // Write the file
        fs.writeFileSync(outputPath, code, 'utf8');
        
        spinner.succeed(`File written successfully`);
        
        // Show file info
        const stats = fs.statSync(outputPath);
        console.log(chalk.green(`\n✅ Generated file:`));
        console.log(chalk.green(`   📄 Path: ${outputPath}`));
        console.log(chalk.green(`   📏 Size: ${getFileSizeFromBytes(stats.size)}`));
        console.log(chalk.green(`   🕒 Modified: ${stats.mtime.toLocaleString()}`));
        
    } catch (error) {
        spinner.fail('Failed to write output file');
        throw error;
    }
}

// Helper functions
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function needsSRGBColorSpace(type) {
    return TEXTURE_TYPES[type]?.some(keyword => 
        COLOR_SPACE_TEXTURES.includes(keyword)
    );
}

function getMaterialProperty(type) {
    const mapping = {
        diffuse: 'map',
        normal: 'normalMap', 
        roughness: 'roughnessMap',
        metallic: 'metalnessMap',
        ao: 'aoMap',
        displacement: 'displacementMap',
        arm: 'aoMap', // ARM textures typically go to AO slot
        alpha: 'alphaMap'
    };
    return mapping[type];
}

function getRelativePath(sourceDir, outputFile, filename) {
    // Calculate relative path from output file to texture
    const outputDir = path.dirname(outputFile);
    const texturePath = path.join(sourceDir, filename);
    let relativePath = path.relative(outputDir, texturePath);
    
    // Ensure forward slashes for web compatibility
    relativePath = relativePath.replace(/\\/g, '/');
    
    // Ensure it starts with ./ for relative imports
    if (!relativePath.startsWith('./') && !relativePath.startsWith('../')) {
        relativePath = './' + relativePath;
    }
    
    return relativePath;
}

function getFileSizeFromBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
}

function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        const bytes = stats.size;
        
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
        return `${Math.round(bytes / (1024 * 1024))} MB`;
    } catch {
        return 'Unknown';
    }
}

function getUniqueExtensions(files) {
    const extensions = files.map(file => 
        path.extname(file).slice(1).toUpperCase()
    );
    return [...new Set(extensions)].sort();
}
