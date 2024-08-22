const express = require('express')
const auth = require('../middleware/auth')
const router = express.Router()

const bookCtrl = require('../controllers/book')

// Get all the books
router.get('/', bookCtrl.getAllBooks)

// Post a new book
router.post('/', auth, bookCtrl.createBook)

// Get 3 books with the best rating
router.get('/bestrating', bookCtrl.getBestRating);

  //Get one specific book
router.get('/:id', bookCtrl.getOneBook)

// // Put book :id
// router.put('/:id', bookCtrl.modifyBook)

// //delete book :id
// router.delete('/:id', bookCtrl.deleteBook)

// //post :id rating
// router.post('/:id/rating', bookCtrl.createRatingBook)

  module.exports = router;