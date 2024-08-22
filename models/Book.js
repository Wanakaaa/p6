const mongoose = require('mongoose')

const bookSchema = mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String },
    author: { type: String },
    imageUrl: { type: String },
    year: { type: Number },
    genre: { type: String },
    averageRating: { type: Number },
    ratings: [{
        userId: { type: String },
        grade: { type: Number }
    }]
})

module.exports = mongoose.model('Book', bookSchema)