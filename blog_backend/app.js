const express = require('express')

const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const blogRouter = require('./controllers/blogs')
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const testRouter = require('./controllers/tests')
const middleware = require('./utils/middleware')

app.use(middleware.requestLogger)

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        console.info('connected to MongoDB')
    })
    .catch((error) => {
        console.error('error connecting to MongoDB:', error.message)
    })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

app.use(middleware.tokenExtractor)

app.use('/api/blogs', blogRouter)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)

if (config.NODE_ENV === 'test') {
    app.use('/api/testing', testRouter)
}

app.use(middleware.errorHandler)

module.exports = app
