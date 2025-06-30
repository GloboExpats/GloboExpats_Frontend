const fs = require('fs')
const path = require('path')

const OPTIMIZED_DIR = path.join(__dirname, '../public/images/optimized')

// Mapping of current random filenames to descriptive names based on the products they represent
const imageRenameMap = {
  'pexels-pixabay-371924': 'luxury-living-room-furniture',
  'pexels-pixabay-38568': 'professional-camera-equipment',
  'pexels-pixabay-39671': 'vintage-wooden-coffee-table',
  'pexels-mikebirdy-170811': 'premium-kitchen-appliances',
  'pexels-pixabay-163696': 'modern-office-desk-setup',
  'pexels-melvin-buezo-1253763-2529148': 'artisan-pottery-collection',
  'pexels-marleneleppanen-1183266': 'designer-fashion-collection',
  'pexels-jessbaileydesign-788946': 'high-end-audio-system',
  'pexels-jacobmorch-457418': 'fitness-equipment-bundle',
  'pexels-igor-starkov-233202-914388': 'luxury-watch-collection',
  'pexels-heyho-6198655': 'smart-home-technology-kit',
  'pexels-goumbik-669582': 'outdoor-adventure-gear',
  'pexels-alexandra-maria-58259-336372': 'premium-skincare-products',
  'pexels-aj-ahamad-767001191-30147878': 'professional-dj-equipment',
  'panos-sakalakis-63sI4HO30tw-unsplash': 'sustainable-living-products',
  'maria-lin-kim-IumYoHVeSmI-unsplash': 'books-educational-materials',
  'marek-pospisil-oUBjd22gF6w-unsplash': 'imported-furniture-set',
  'joshua-koblin-eqW1MPinEV4-unsplash': 'gaming-setup-complete',
  'irene-kredenets-dwKiHoqqxk8-unsplash': 'handmade-crafts-collection',
  'campbell-3ZUsNJhi_Ik-unsplash': 'professional-kitchen-tools',
  'c-d-x-PDX_a_82obo-unsplash': 'electronics-bundle-deal',
  'pexels-solliefoto-298863': 'outdoor-furniture-set',
  'pexels-ron-lach-7859350': 'vintage-camera-collection',
  'pexels-stasknop-1330638': 'baby-kids-furniture',
  'pexels-stasknop-1579240': 'sports-equipment-bundle',
  'pexels-steve-923192': 'art-decor-collection',
  'pexels-thepaintedsquare-3405456': 'home-security-system',
  'pexels-thought-catalog-317580-2228557': 'library-study-materials',
  'pexels-zeleboba-32728404': 'luxury-bedding-set',
  'pexels-zvolskiy-2082092': 'electric-vehicle-accessories',
}

function renameImages() {
  console.log('🔄 Starting image renaming process...\n')

  let renamedCount = 0
  let errorCount = 0

  for (const [oldName, newName] of Object.entries(imageRenameMap)) {
    const sizes = ['thumb', 'medium', 'large']

    console.log(`📝 Renaming "${oldName}" → "${newName}"`)

    for (const size of sizes) {
      const oldFile = path.join(OPTIMIZED_DIR, `${oldName}-${size}.jpg`)
      const newFile = path.join(OPTIMIZED_DIR, `${newName}-${size}.jpg`)

      try {
        if (fs.existsSync(oldFile)) {
          fs.renameSync(oldFile, newFile)
          console.log(`  ✓ ${oldName}-${size}.jpg → ${newName}-${size}.jpg`)
          renamedCount++
        } else {
          console.log(`  ⚠ File not found: ${oldName}-${size}.jpg`)
        }
      } catch (error) {
        console.error(`  ✗ Error renaming ${oldName}-${size}.jpg:`, error.message)
        errorCount++
      }
    }
    console.log('')
  }

  console.log('📊 Renaming Summary:')
  console.log(`  ✅ Successfully renamed: ${renamedCount} files`)
  console.log(`  ❌ Errors: ${errorCount} files`)
  console.log(`  📁 Total image sets processed: ${Object.keys(imageRenameMap).length}`)

  if (errorCount === 0) {
    console.log('\n🎉 All images renamed successfully!')
  } else {
    console.log('\n⚠️  Some files had errors. Please check the output above.')
  }
}

// Export the rename map for use in updating constants
module.exports = { imageRenameMap }

// Run the renaming if called directly
if (require.main === module) {
  renameImages()
}
