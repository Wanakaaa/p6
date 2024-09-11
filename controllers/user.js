const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/User')

exports.signup = (req, res, next) => {
    const password = req.body.password
    const email = req.body.email
    const minLength = 8;
    if (password.length < minLength) {
        return res.status(400).json({error: new Error ('Le mot de passe doit contenir au minimum 8 caractères')})
    }
    const regexEmail = /^[\w.-]+@[a-zA-Z\d.-]+.[a-zA-Z]{2,}$/
    if (regexEmail.test(email) === false){
        return res.status(400).json({error: new Error(`L'adresse mail n'est pas valide`)})
    }
    bcrypt.hash(password, 10)
        .then(hash => {
            const user = new User({ 
                email: email,
                password: hash
            })
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé' }))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
}


exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => { 
            if(user === null) {
                res.status(401).json({ error: new Error('Paire identifiant/mot de passe incorrecte')})
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            res.status(401).json({ error: new Error('Paire identifiant/mot de passe incorrecte') })
                        } else {
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    process.env.JWT_SECRET_KEY,
                                    { expiresIn: '24h' }
                                ),
                            })
                        }
                    })
                    .catch(error => res.status(500).json({ error }))
            }
        })
        .catch(error => res.status(500).json({ error }))
}