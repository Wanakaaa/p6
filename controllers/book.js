const express = require('express')
const Book = require('../models/Book')
const fs = require('fs')
const sharp = require('sharp')
const path = require('path')
const { isDirExist } = require('../utils/fileUtils')
const { optimizeImg } = require('../utils/imageUtils')

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json( { error }))
}

// On parse car maintenant, avec multer, le format de la requête aura changé
// l'objet qui nous envoyé dans la requête sous forme JSON mais sous chaine de caractère

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
      .sort({ averageRating: -1 }) // Trie par note moyenne décroissante
      .limit(3) // Limite à 3 résultats
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
    } : { ...req.body }

    delete bookObject._userId
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(400).json({ message: 'Non autorisé' })
            } else {
                if (req.file) {
                    console.log('req.file: ', req.file)
                    const oldFilename = book.imageUrl.split('/images/')[1]
                    console.log('ancien nom: ', oldFilename)
                    fs.unlink(`images/${oldFilename}`, (error) => {
                        if (error) console.error('erreur de suppression', error)
                    })
                }
                console.log('bookObject : ', { ...bookObject, _id: req.params.id })
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre modifié' }))
                    .catch(error => res.status(401).json({ error }))
            }
        })
        .catch(error => res.status(400).json({ error }))
}

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé' })
            } else {
                const filename = book.imageUrl.split('/images/')[1]
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Livre supprimé' }))
                        .catch(error => res.status(401).json({ error }))
                })
            }
        })
        .catch( error => res.status(500).json({ error }))
}


exports.createRatingBook = (req, res, next) => {
    //grade needs to be between 1 and 5 

    //sur la requête reçue
    const userId = req.auth.userId
    const bookId = req.params.id
    const rating = req.body.rating

    const isRatingCorrect = (rating, min = 1, max = 5) => {
        return rating >= min && rating <= max
    }

    if (!isRatingCorrect(rating)) {
        return res.status(403).json({ message: 'La note doit être comprise entre 1 et 5'})
    }

    Book.findOne({ _id: bookId })
        .then((book) => { 
            let isAlreadyRated = book.ratings.some((rat) => rat.userId === userId )
                if (isAlreadyRated === true) {
                return res.status(403).json({ message: 'Vous avez déjà noté ce livre. ' })
            } else {
                book.ratings.push({
                    userId: userId,
                    grade: rating
                })
            }

            let totalRatings = book.ratings.map((rat) => rat.grade)
            let sumGrades = totalRatings.reduce((acc, grade) => acc + grade, 0)

            let averageRatingGrade = totalRatings.length > 0 ? Math.round(sumGrades / totalRatings.length) : 0;

            console.log('Moyenne des notes: ', averageRatingGrade)


            return Book.updateOne({ _id: bookId }, {
                //Quand la note a été ajouté, on calcule le averageRating
                // On prend toute les notes enregistrées et on divise par la longueur du tableau
                //comment faire pour que ça s'affiche directement ? 
                averageRating: averageRatingGrade,
                ratings: book.ratings
            })
            .then(() => {
                return Book.findOne({ _id: bookId });
            })
            .then((updatedBook) => {
                res.status(200).json(updatedBook);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).json({ message: 'Erreur lors de la mise à jour du livre.' });
            });
                
            // .then(() =>  res.status(200).json(book))
            // .catch(error => console.log(error))
        })
}
