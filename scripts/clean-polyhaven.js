import fs from 'fs';
import path from 'path';

// Configuration
const TEXTURE_DIR = './public/textures';
const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'exr', 'png'];
const SIZE_SUFFIXES = ['1k', '2k', '4k', '8k'];

/**
 * Recursively finds texture directories and processes them
 */
function processTextureDirectories(dirPath) {
    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        const subdirs = entries.filter(entry => entry.isDirectory());

        // Check if this directory contains a 'textures' subdirectory
        const textureSubdir = subdirs.find(dir => dir.name === 'textures');
        
        if (textureSubdir) {
            const texturesDirPath = path.join(dirPath, textureSubdir.name);
            const parentDirName = path.basename(dirPath);
            
            console.log(`Processing textures in: ${texturesDirPath}`);
            cleanupTextureFiles(texturesDirPath, parentDirName);
        }

        // Recursively process subdirectories
        const remainingSubdirs = subdirs.filter(dir => dir.name !== 'textures');
        remainingSubdirs.forEach(subdir => {
            const subdirPath = path.join(dirPath, subdir.name);
            processTextureDirectories(subdirPath);
        });

    } catch (error) {
        console.error(`Error processing directory ${dirPath}:`, error.message);
    }
}

function cleanupTextureFiles(texturesDirPath, parentDirName) {
    try {
        const entries = fs.readdirSync(texturesDirPath, { withFileTypes: true });
        
        // Validate directory contains only supported texture files
        if (!validateTextureDirectory(entries, texturesDirPath)) {
            return;
        }

        const files = entries.filter(entry => entry.isFile());
        const { prefixToRemove, sizeSuffix } = extractNamingPattern(parentDirName);
        
        console.log(`Removing prefix: "${prefixToRemove}", Size suffix: "${sizeSuffix}"`);

        // Process each file
        files.forEach(file => {
            const oldPath = path.join(texturesDirPath, file.name);
            const newName = cleanupFileName(file.name, prefixToRemove, sizeSuffix);
            const newPath = path.join(texturesDirPath, newName);

            if (oldPath !== newPath) {
                renameFileWithCheck(oldPath, newPath)
            }
        });

        // Move files up one level and remove textures directory
        moveFilesUpAndRemoveTexturesDir(texturesDirPath);

    } catch (error) {
        console.error(`Error cleaning up ${texturesDirPath}:`, error.message);
    }
}

/**
 * Validates that a directory contains only supported texture files
 */
function validateTextureDirectory(entries, dirPath) {
    for (const entry of entries) {
        if (!entry.isFile()) {
            console.warn(`Skipping ${dirPath}: contains non-file entry "${entry.name}"`);
            return false;
        }

        const extension = path.extname(entry.name).slice(1).toLowerCase();
        if (!SUPPORTED_EXTENSIONS.includes(extension)) {
            console.warn(`Skipping ${dirPath}: unsupported file type "${entry.name}"`);
            return false;
        }
    }
    return true;
}

/**
 * Extracts the naming pattern from parent directory name
 */
function extractNamingPattern(parentDirName) {
    const parts = parentDirName.split('_');
    const lastPart = parts[parts.length - 1];
    
    if (SIZE_SUFFIXES.includes(lastPart)) {
        return {
            prefixToRemove: parts.slice(0, -1).join('_'),
            sizeSuffix: lastPart
        };
    } else {
        return {
            prefixToRemove: parentDirName,
            sizeSuffix: ''
        };
    }
}

/**
 * Cleans up a filename by removing prefix and size suffix
 */
function cleanupFileName(filename, prefixToRemove, sizeSuffix) {
    const { name, ext } = path.parse(filename);
    
    let cleanName = name;
    
    // Remove prefix
    if (cleanName.startsWith(prefixToRemove)) {
        cleanName = cleanName.slice(prefixToRemove.length);
    }
    
    // Remove leading underscore
    cleanName = cleanName.replace(/^_+/, '');
    
    // Remove size suffix
    if (sizeSuffix) {
        cleanName = cleanName.replace(new RegExp(`_${sizeSuffix}$`), '');
    }
    
    return cleanName + ext;
}

/**
 * Safely renames a file with conflict checking
 */
function renameFileWithCheck(oldPath, newPath) {
    try {
        if (fs.existsSync(newPath)) {
            console.warn(`File already exists: ${newPath}`);
            return;
        }
        
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed: ${path.basename(oldPath)} → ${path.basename(newPath)}`);
        
    } catch (error) {
        console.error(`Failed to rename ${oldPath}:`, error.message);
    }
}

/**
 * Moves all files from textures directory to parent and removes textures directory
 */
function moveFilesUpAndRemoveTexturesDir(texturesDirPath) {
    try {
        const parentDir = path.dirname(texturesDirPath);
        const files = fs.readdirSync(texturesDirPath, { withFileTypes: true })
            .filter(entry => entry.isFile());

        console.log(`Moving ${files.length} files up one level...`);

        // Move each file to parent directory
        files.forEach(file => {
            const currentPath = path.join(texturesDirPath, file.name);
            const newPath = path.join(parentDir, file.name);
            
            moveFileWithConflictCheck(currentPath, newPath);
        });

        // Remove empty textures directory
        const remainingEntries = fs.readdirSync(texturesDirPath);
        if (remainingEntries.length === 0) {
            fs.rmdirSync(texturesDirPath);
            console.log(`Removed empty textures directory: ${texturesDirPath}`);
        } else {
            console.warn(`Cannot remove textures directory - still contains files: ${remainingEntries.join(', ')}`);
        }

    } catch (error) {
        console.error(`Error moving files from ${texturesDirPath}:`, error.message);
    }
}

/**
 * Moves a file with conflict checking
 */
function moveFileWithConflictCheck(sourcePath, destinationPath) {
    try {
        if (fs.existsSync(destinationPath)) {
            console.warn(`File already exists at destination: ${destinationPath}`);
            return false;
        }
        
        fs.renameSync(sourcePath, destinationPath);
        console.log(`Moved: ${path.basename(sourcePath)} → ${destinationPath}`);
        return true;
        
    } catch (error) {
        console.error(`Failed to move ${sourcePath} to ${destinationPath}:`, error.message);
        return false;
    }
}

/**
 * Main execution
 */
console.log('Starting texture cleanup...');
processTextureDirectories(TEXTURE_DIR);
console.log('Texture cleanup complete!');