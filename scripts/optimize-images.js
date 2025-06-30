const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const INPUT_DIR = path.join(__dirname, '../public/images')
const OUTPUT_DIR = path.join(__dirname, '../public/images/optimized')

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

async function optimizeImage(inputPath, outputPath, options = {}) {
  const { width = 800, height = 600, quality = 80, format = 'jpeg' } = options

  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality })
      .toFile(outputPath)

    const inputStats = fs.statSync(inputPath)
    const outputStats = fs.statSync(outputPath)
    const reduction = (((inputStats.size - outputStats.size) / inputStats.size) * 100).toFixed(1)

    console.log(
      `✓ ${path.basename(inputPath)}: ${(inputStats.size / 1024 / 1024).toFixed(2)}MB → ${(outputStats.size / 1024 / 1024).toFixed(2)}MB (${reduction}% reduction)`
    )
  } catch (error) {
    console.error(`✗ Failed to optimize ${path.basename(inputPath)}:`, error.message)
  }
}

async function optimizeAllImages() {
  console.log('🖼️  Starting image optimization...\n')

  const files = fs.readdirSync(INPUT_DIR)
  const imageFiles = files.filter((file) => {
    const ext = path.extname(file).toLowerCase()
    return (
      (['.jpg', '.jpeg', '.png'].includes(ext) &&
        !file.startsWith('hero-') && // Keep hero images as is
        !file.startsWith('seller-avatar') && // Keep avatars as is
        file.includes('pexels-')) ||
      file.includes('unsplash')
    ) // Only optimize stock photos
  })

  console.log(`Found ${imageFiles.length} images to optimize\n`)

  // Different sizes for different use cases
  const sizes = [
    { suffix: '-thumb', width: 300, height: 200, quality: 75 },
    { suffix: '-medium', width: 600, height: 400, quality: 80 },
    { suffix: '-large', width: 1200, height: 800, quality: 85 },
  ]

  for (const file of imageFiles) {
    const inputPath = path.join(INPUT_DIR, file)
    const baseName = path.parse(file).name

    console.log(`Processing ${file}...`)

    for (const size of sizes) {
      const outputFile = `${baseName}${size.suffix}.jpg`
      const outputPath = path.join(OUTPUT_DIR, outputFile)

      await optimizeImage(inputPath, outputPath, size)
    }

    console.log('')
  }

  console.log('🎉 Image optimization complete!')
  console.log(`📁 Optimized images saved to: ${OUTPUT_DIR}`)
}

// Run the optimization
optimizeAllImages().catch(console.error)
