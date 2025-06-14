import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const LOGO_DIR = 'static/logo';
const ICO_DIR = 'static';
const SVG_PATH = path.join(LOGO_DIR, 'logo.svg');

async function processImages() {
    try {
        // Read the SVG file
        const svgBuffer = await fs.readFile(SVG_PATH);
        
        // Convert to PNG
        await sharp(svgBuffer)
            .png()
            .toFile(path.join(LOGO_DIR, 'logo.png'));
       
        // Copy the PNG file to the ICO directory
        await fs.copyFile(path.join(LOGO_DIR, 'logo.png'), path.join(ICO_DIR, 'favicon.png'));
            
        // Create ICO with multiple sizes
        const sizes = [16, 32];
        const pngBuffers = await Promise.all(
            sizes.map(size => 
                sharp(svgBuffer)
                    .resize(size, size)
                    .png()
                    .toBuffer()
            )
        );
        
        // Combine PNGs into ICO
        await sharp(pngBuffers[0])
            .joinChannel(pngBuffers[1])
            .toFile(path.join(LOGO_DIR, 'favicon.ico'));
            
        console.log('✅ Image processing complete');
    } catch (error) {
        console.error('❌ Error processing images:', error);
        process.exit(1);
    }
}

processImages(); 