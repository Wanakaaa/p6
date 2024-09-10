const multer = require('multer')
const sharp = require('sharp')
const path = require('path')

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
}

// Stockage en mémoire temporaire
const storage = multer.memoryStorage(); 

const upload = multer({ storage }).single('image')

const compressImage = (req, res, next) => {
    if (!req.file) {
        return next(); // S'il n'y a pas de fichier, passer à la suite
    }

    const extension = MIME_TYPES['image/webp'] || 'webp'; // On passe toutes les images en .webp
    const name = req.file.originalname.split(' ').join('_').split('.')[0]; // Nom sans l'extension
    const filename = `${name}_${Date.now()}.${extension}`; // Nouveau nom avec timestamp

    console.log('Nom du fichier après compression : ', filename);

    sharp(req.file.buffer)
        .resize(206, 260) 
        .toFormat('webp')
        .toFile(path.join('images', filename)) // Sauvegarder l'image compressée
        .then(() => {
            req.file.path = `images/${filename}`; // Mettre à jour le chemin du fichier dans req.file
            req.file.filename = filename; // Mettre à jour le nom du fichier dans req.file
            next();
        })
        .catch((err) => {
            console.error('Erreur lors de la compression de l\'image:', err);
            res.status(500).json({ error: 'Erreur lors du traitement de l\'image' });
        });
}

module.exports = { upload, compressImage };