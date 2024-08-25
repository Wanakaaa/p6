const multer = require('multer')

// //2) dictionnaire qui est un objet
// const MIME_TYPES = {
//     'image/jpg': 'jpg',
//     'image/jpeg': 'jpg',
//     'image/png': 'png'
// }

const storage = multer.memoryStorage()

const upload = multer({ storage })

module.exports = upload.single('image');


//1)création de l'objet de configuration pour multer
//multer.diskStorage pour dire qu'on va l'enregistrer sur le disque
// l'objet de configuration que l'on passe à diskStorage a besoin de 2 éléments: la destination (fonction qui va retourner à multer dans quel 
//dossier enregistrer les fichiers) 
// la destination prend 3 arguments, requete, file et callback. on appelle le callback tout de suite en passant un 
//argument null pour dire qu'il n'y a pas eu d'erreur à ce niveau la, et le nom du dossier en 2nd argument
// 2nd argument : filename : quel est le nom de fichier utilisé ? 

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