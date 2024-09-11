const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')
const sharp = require('../middleware/sharp')


const bookCtrl = require('../controllers/book')

// Post a new book
router.post('/', auth, multer, sharp, bookCtrl.createBook)

// Get all the books
router.get('/', bookCtrl.getAllBooks)

// Get 3 books with the best rating
router.get('/bestrating', bookCtrl.getBestRating);

  //Get one specific book
router.get('/:id', bookCtrl.getOneBook)

// // Put book :id
router.put('/:id', auth, multer, sharp, bookCtrl.modifyBook)

// //delete book :id
router.delete('/:id', auth, bookCtrl.deleteBook)

// //post :id rating
router.post('/:id/rating', auth, bookCtrl.createRatingBook)

module.exports = router;