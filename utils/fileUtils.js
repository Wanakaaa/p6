const fs = require('fs').promises
const path = require('path')

async function isDirExist(directory) {
    try {
        await fs.access(directory)
    } catch {
        await fs.mkdir(directory, { recursive: true })
    }
}

module.exports = { isDirExist }