import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import sharp from 'sharp';
import toIco from 'to-ico';
import { fileURLToPath } from 'url';

const sizes = [16, 32, 48, 64, 128, 256];

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const sourcePath = join(projectRoot, 'logo.png')
const publicDir = join(projectRoot, 'src', 'render', 'public')
const buildDir = join(projectRoot, 'build', 'icons')

async function generateFavicon() {
    try {
        console.log('🎨 Generating favicon files from logo.png...');
        mkdirSync(publicDir, { recursive: true });
        mkdirSync(buildDir, { recursive: true });

        // Create PNG buffers for all sizes
        const pngBuffers = await Promise.all(
            sizes.map((size) =>
                sharp(sourcePath)
                    .resize(size, size, {
                        fit: 'contain',
                        background: { r: 255, g: 255, b: 255, alpha: 0 }
                    })
                    .png()
                    .toBuffer()
            )
        );

        // Generate multi-resolution favicon.ico with all sizes
        const multiResIcoBuffer = await toIco(pngBuffers);
        const multiResPath = resolve(publicDir, 'favicon.ico');
        writeFileSync(multiResPath, multiResIcoBuffer);
        console.log(`   ✅ favicon.ico (multi-resolution: ${sizes.map(s => `${s}×${s}`).join(', ')})`);

        // Generate largest ICO (256x256) for public dir
        const largestIcoBuffer = await toIco([pngBuffers[pngBuffers.length - 1]]);
        const largestIcoPath = resolve(publicDir, 'favicon-256.ico');
        writeFileSync(largestIcoPath, largestIcoBuffer);
        console.log(`   ✅ favicon-256.ico (256×256)`);

        // Generate high-resolution PNG for Linux (256x256)
        const pngPath = join(buildDir, 'icon.png');
        await sharp(sourcePath)
            .resize(256, 256, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .png()
            .toFile(pngPath);
        console.log(`   ✅ icon.png (256×256 for Linux)`);

        // Generate macOS icns format (512x512 and 1024x1024)
        const mac512 = await sharp(sourcePath)
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png()
            .toBuffer();

        const mac1024 = await sharp(sourcePath)
            .resize(1024, 1024, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png()
            .toBuffer();

        // Use PNG to ICNS conversion (requires imagemagick or similar)
        // For now, save as PNG and user can convert manually or use online tool
        writeFileSync(join(buildDir, 'icon-512.png'), mac512);
        writeFileSync(join(buildDir, 'icon-1024.png'), mac1024);
        console.log(`   ✅ icon-512.png & icon-1024.png (for macOS icns conversion)`);

        // Also create a 256x256 version for Windows taskbar
        const win256 = await sharp(sourcePath)
            .resize(256, 256, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .png()
            .toBuffer();
        writeFileSync(join(buildDir, 'icon-256.png'), win256);
        console.log(`   ✅ icon-256.png (256×256 for all platforms)`);

        console.log('\n✅ All icon files generated successfully!');
    } catch (error) {
        console.error('❌ Error generating icons:', error);
        process.exit(1);
    }
}

generateFavicon();
