const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

async function optimizeImg(buffer, originalname, destDir) {
    const timestamp = Date.now()
    const filename = `${timestamp}-${originalname.split(' ').join('_')}.webp`
    const filePath = path.join(destDir, filename)

    await sharp(buffer)
        .resize(206, 260)
        .webp({ quality: 80 })
        .toFile(filePath)

    return filename
}

module.exports = { optimizeImg }