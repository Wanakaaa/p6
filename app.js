const express = require('express')
const cors = require('cors')
const mongoose = require ('mongoose')
require('dotenv').config()

const app = express()

const bookRoutes = require('./routes/book')
const userRoutes = require('./routes/user')
const path = require('path');

mongoose.connect(`mongodb+srv://${process.env.user}:${process.env.password}@cluster0.da4xz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch(() => console.log('Connexion à MongoDB échouée'))

app.use(express.json());
app.use(cors())

app.use('/api/books', bookRoutes)
app.use('/api/auth', userRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')))

module.exports = app