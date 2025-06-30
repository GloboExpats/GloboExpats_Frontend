const fs = require('fs')
const path = require('path')

const CONSTANTS_FILE = path.join(__dirname, '../lib/constants.ts')

// Import the rename mapping from the rename script
const { imageRenameMap } = require('./rename-images.js')

function updateConstants() {
  console.log('🔄 Updating constants.ts with new image names...\n')

  try {
    // Read the current constants file
    let content = fs.readFileSync(CONSTANTS_FILE, 'utf8')

    let updatedCount = 0

    // Update each image reference
    for (const [oldName, newName] of Object.entries(imageRenameMap)) {
      const oldPath = `/images/optimized/${oldName}-medium.jpg`
      const newPath = `/images/optimized/${newName}-medium.jpg`

      if (content.includes(oldPath)) {
        content = content.replace(
          new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          newPath
        )
        console.log(`✓ Updated: ${oldName}-medium.jpg → ${newName}-medium.jpg`)
        updatedCount++
      }
    }

    // Also update any avatar references in mock-users.json that might use optimized images
    const MOCK_USERS_FILE = path.join(__dirname, '../public/mock-users.json')
    if (fs.existsSync(MOCK_USERS_FILE)) {
      let usersContent = fs.readFileSync(MOCK_USERS_FILE, 'utf8')
      let usersUpdated = false

      for (const [oldName, newName] of Object.entries(imageRenameMap)) {
        const oldPath = `/images/optimized/${oldName}-thumb.jpg`
        const newPath = `/images/optimized/${newName}-thumb.jpg`

        if (usersContent.includes(oldPath)) {
          usersContent = usersContent.replace(
            new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            newPath
          )
          console.log(`✓ Updated avatar: ${oldName}-thumb.jpg → ${newName}-thumb.jpg`)
          usersUpdated = true
        }
      }

      if (usersUpdated) {
        fs.writeFileSync(MOCK_USERS_FILE, usersContent, 'utf8')
        console.log('✓ Updated mock-users.json')
      }
    }

    // Write the updated content back to the file
    fs.writeFileSync(CONSTANTS_FILE, content, 'utf8')

    console.log(`\n📊 Update Summary:`)
    console.log(`  ✅ Successfully updated: ${updatedCount} image references`)
    console.log(`  📄 File updated: ${CONSTANTS_FILE}`)

    if (updatedCount > 0) {
      console.log('\n🎉 Constants file updated successfully!')
      console.log('   All image references now use descriptive names.')
    } else {
      console.log('\n⚠️  No image references were found to update.')
    }
  } catch (error) {
    console.error('❌ Error updating constants:', error.message)
  }
}

// Run the update if called directly
if (require.main === module) {
  updateConstants()
}

module.exports = { updateConstants }
