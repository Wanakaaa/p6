const express = require('express')
const Book = require('../models/Book')

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json( { error }))
}

exports.createBook = (req, res, next) => {
    delete req.body.id
    const book = new Book({
        ...req.body
    })
    book.save()
      .then(() => res.status(200).json({ message: 'enregistre'}))
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