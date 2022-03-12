const testRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')
const logger = require('../utils/logger')

testRouter.post('/reset', async (req, res) => {
    await User.deleteMany({})
    await Blog.deleteMany({})
    const blog = new Blog({
        url: 'asdas',
        title: 'asdasdas',
    })
    blog.save()
    logger.info('Emptied database for testing')
    res.status(204).end()
})

module.exports = testRouter
