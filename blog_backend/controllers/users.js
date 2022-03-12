const userRouter = require('express').Router()
const bcrypt = require('bcrypt')

const User = require('../models/user')
const logger = require('../utils/logger')

userRouter.post('/', async (req, res, next) => {
    const { username, name, password } = req.body
    if (!username || username.length < 3) {
        await res.status(400).send({ error: 'Username must be larger than 3' })
    }
    if (!password || password.length < 3) {
        await res.status(400).send({ error: 'Password must be larger than 3' })
    }
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    try {
        const user = new User({ username, name, passwordHash })
        const savedUser = await user.save()
        logger.info(`User ${username} was created`)
        res.json(savedUser)
    } catch (err) {
        next(err)
    }
})

userRouter.get('/', async (req, res) => {
    try {
        const users = await User.find({}, '-passwordHash').populate('blogs', { title: 1, url: 1, likes: 1,})
        logger.info('Returned a list of users')
        res.json(users)
    } catch (err) {
        res.status(404).send(err)
    }
})

module.exports = userRouter
