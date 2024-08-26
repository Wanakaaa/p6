const multer = require('multer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
}

const storage = multer.memoryStorage(); // Stockage en mémoire temporaire

const upload = multer({ storage }).single('image')

const compressImage = (req, res, next) => {
    if (!req.file) {
        return next(); // S'il n'y a pas de fichier, passer à la suite
    }

    const extension = MIME_TYPES['image/webp'] || 'webp'; // On passe toutes les images en .webp
    const name = req.file.originalname.split(' ').join('_').split('.')[0]; // Nom sans l'extension
    const filename = `${name}_${Date.now()}.${extension}`; // Nouveau nom avec timestamp

    sharp(req.file.buffer)
        .resize(206, 260) // Redimensionner l'image à une largeur maximale de 800px
        .toFormat('webp') // Convertir en WebP
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

// const multer = require('multer')

// const MIME_TYPES = {
//     'image/jpg': 'jpg',
//     'image/jpeg': 'jpg',
//     'image/png': 'png'
// }

// const storage = multer.diskStorage({
//     destination: (req, file, callback) => {
//         callback(null, 'images')
//     },
//     filename: (req, file, callback) => {
//         const name = file.originalname.split(' ').join('_')
//         const extension = MIME_TYPES[file.mimetype]
//         callback(null, name + Date.now() + '.' + extension)
//     }
// })

// module.exports = multer({ storage }).single('image')

//2) dictionnaire qui est un objet

//1)création de l'objet de configuration pour multer
//multer.diskStorage pour dire qu'on va l'enregistrer sur le disque
// l'objet de configuration que l'on passe à diskStorage a besoin de 2 éléments: la destination (fonction qui va retourner à multer dans quel 
//dossier enregistrer les fichiers) 
// la destination prend 3 arguments, requete, file et callback. on appelle le callback tout de suite en passant un 
//argument null pour dire qu'il n'y a pas eu d'erreur à ce niveau la, et le nom du dossier en 2nd argument
// 2nd argument : filename : quel est le nom de fichier utilisé ? 