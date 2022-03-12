const loginRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const logger = require('../utils/logger')

loginRouter.post('/', async (req, res, next) => {
    const { username, password } = req.body
    try {
        const dbUser = await User.findOne({ username })
        if (dbUser) {
            const match = await bcrypt.compare(password, dbUser.passwordHash)
            if (match) {
                const claims = {
                    username: dbUser.username,
                    id: dbUser._id,
                }
                const token = await jwt.sign(claims, process.env.SECRET)
                logger.info(`User ${dbUser.username} has logged in`)
                res.status(200).send({ token, username: dbUser.username, name: dbUser.name })
            } else {
                res.status(401).send({ error: 'Password doesn\'t match' })
            }
        } else {
            res.status(401).send({ error: 'User doesn\'t exist' })
        }
    } catch (err) {
        next(err)
    }
})

module.exports = loginRouter
