const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const JsonWebTokenError = require('jsonwebtoken/lib/JsonWebTokenError')

const logger = require('./logger')
const User = require('../models/user')

const tokenExtractor = (req, _, next) => {
    try {
        const authorization = req.get('authorization')
        if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
            req.token = authorization.substring(7)
        }
    } catch (err) {
        next(err)
    }
    next()
}

const userExtractor = async (req, _, next) => {
    try {
        const decodedToken = await jwt.verify(req.token, process.env.SECRET)
        const user = await User.findById(decodedToken.id)
        if (user === null) {
            throw JsonWebTokenError
        }
        req.user = user
    } catch (err) {
        next(err)
    }
    next()
}

// eslint-disable-next-line consistent-return
const errorHandler = (error, req, res, next) => {
    if (error.name === 'CastError') {
        logger.error('Bad request')
        return res.status(400).send({ error: 'malformated id' })
    }

    if (error.name === 'JsonWebTokenError') {
        return res.status(401).send({ error: 'Token is invalid' })
    }

    if (error.name === 'ValidationError') {
        const status = 400
        logger.error('Bad request')
        for (const key of Object.keys(error.errors)) {
            if (error.errors[key].kind === 'unique') {
                return res.status(409).json({ error: error.errors[key].message })
            }
        }
        return res.status(status).json(error.errors)
    }

    if (error.name === 'ReferenceError') {
        logger.error('Bad request')
        return res.status(400).send({ error: error.message })
    }

    next(error)
}

morgan.token('body', (req) => JSON.stringify(req.body))
const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms :body')

module.exports = {
    errorHandler,
    requestLogger,
    tokenExtractor,
    userExtractor,
}
