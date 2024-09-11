const sharp = require('sharp')
const path = require('path')

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
}

module.exports= (req, res, next) => {
        if (!req.file) {
            return next()
        }
    
        const extension = MIME_TYPES['image/webp'] || 'webp'
        const name = req.file.originalname.split(' ').join('_').split('.')[0]
        const filename = `${name}_${Date.now()}.${extension}`
    
        sharp(req.file.buffer)
            .resize(206, 260) 
            .toFormat('webp')
            .toFile(path.join('images', filename)) 
            .then(() => {
                req.file.path = `images/${filename}`
                req.file.filename = filename
                next()
            })
            .catch((error) => {
                res.status(500).json({ error })
            })
    }

