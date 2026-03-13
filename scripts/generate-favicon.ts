import { writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import sharp from 'sharp';
import toIco from 'to-ico';
import { fileURLToPath } from 'url';

const sizes = [16, 32, 48, 64, 128, 256];


const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const sourcePath = join(projectRoot, 'logo.png')
const publicDir = join(projectRoot, 'src', 'render', 'public')

async function generateFavicon() {
    try {
        console.log('🎨 Generating favicon files from logo.png...');

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

        // Generate individual ICO files for each size
        for (let i = 0; i < sizes.length; i++) {
            const size = sizes[i];
            const fileName = `favicon-${size}.ico`;
            const icoBuffer = await toIco([pngBuffers[i]]);
            const filePath = resolve(publicDir, fileName);
            writeFileSync(filePath, icoBuffer);
            console.log(`   ✅ ${fileName} (${size}×${size})`);
        }

        // Generate multi-resolution favicon.ico with all sizes
        const multiResIcoBuffer = await toIco(pngBuffers);
        const multiResPath = resolve(publicDir, 'favicon.ico');
        writeFileSync(multiResPath, multiResIcoBuffer);
        console.log(`   ✅ favicon.ico (multi-resolution: ${sizes.map(s => `${s}×${s}`).join(', ')})`);

        console.log('\n✅ All favicon files generated successfully!');
    } catch (error) {
        console.error('❌ Error generating favicon:', error);
        process.exit(1);
    }
}

generateFavicon();
