const Book = require('../models/Book')
const fs = require('fs')
const path = require('path')

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json( { error }))
}

exports.createBook = (req, res, next) => {  
    const bookObject = JSON.parse(req.body.book)
    delete bookObject._id
    delete bookObject._userId

    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    book.save()
        .then(() => res.status(201).json({message: 'livre enregistré'}))
        .catch(error => res.status(400).json({ error }))
}

exports.getBestRating = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 })
        .limit(3)
            .then((books) => res.status(200).json(books))
            .catch(error => res.status(500).json({ error }))
}

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }))
}

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : req.body

    delete bookObject._userId

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: 'Non autorisé' })
            } else {
                if (req.file) {
                    const oldFilename = book.imageUrl.split('/images/')[1]
                    fs.unlink(`images/${oldFilename}`, (error) => {
                        if (error) console.error('erreur de suppression', error)
                    })
                }
                Book.updateOne({ _id: req.params.id }, { ...bookObject })
                // Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre modifié' }))
                    .catch(error => res.status(401).json({ error }))
            }
        })
        .catch(error => res.status(400).json({ error }))
}


exports.deleteBook = (req, res, next) => {
    Book.findOneAndDelete({ _id: req.params.id})
        .then((book) => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé' });
            }
            if (book.userId != req.auth.userId) {
                return res.status(403).json({ message: 'Non autorisé' })
            }

            const filename = book.imageUrl.split('/images/')[1];
            const filePath = path.join('images', filename);
            fs.unlink(filePath, (error) => {
                if (error) {
                    console.error('Erreur de suppression du fichier:', error);
                }

                res.status(200).json({ message: 'Livre et image supprimés' });
            });
        })
        .catch(error => {
            res.status(500).json({ error });
        });
}

exports.createRatingBook = (req, res, next) => {
    const isRatingCorrect = (rating, min = 1, max = 5) => rating >= min && rating <= max
    if (!isRatingCorrect(req.body.rating)) {
        return res.status(403).json({ message: 'La note doit être comprise entre 1 et 5'})
    }
    Book.findOne({ _id: req.params.id })
        .then((book) => { 
            let isAlreadyRated = book.ratings.some((rating) => rating.userId === req.auth.userId )
                if (isAlreadyRated) {
                return res.status(403).json({ message: 'Livre déjà noté.' })
            }

            book.ratings.push({
                userId: req.auth.userId,
                grade: req.body.rating
            })
            let arrayGrades = book.ratings.map((rating) => rating.grade)
            let sumGrades = arrayGrades.reduce((acc, grade) => acc + grade, 0)
            let averageRatingGrade = arrayGrades.length > 0 ? Math.round(sumGrades / arrayGrades.length) : 0;
            
            return Book.findOneAndUpdate(
                { _id: req.params.id }, 
                {
                    averageRating: averageRatingGrade,
                    ratings: book.ratings
                },
                { new: true, runValidators: true }
            )
            .then((updatedBook) => {
                res.status(200).json(updatedBook);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).json({ error });
            });
        })
}