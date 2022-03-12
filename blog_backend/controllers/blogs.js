const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const logger = require('../utils/logger')
const middleware = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
    try {
        const blogs = await Blog.find({}).populate('user', { id: 1, name: 1, username: 1 })
        logger.info('Returned a list of blogs')
        response.json(blogs)
    } catch (err) {
        response.status(404).send(err)
    }
})

blogRouter.post('/', middleware.userExtractor, async (request, response, next) => {
    const { body } = request
    if (!Object.prototype.hasOwnProperty.call(request, 'token')) {
        response.status(403).send({ error: 'Token is missing' })
    }
    try {
        const { user } = request
        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
            user: user._id,
        })
        const result = await blog.save()
        user.blogs = user.blogs.concat(result._id)
        user.save()
        logger.info('Added a new blog')
        response.status(201).json(result)
    } catch (err) {
        next(err)
    }
})

blogRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {
    const { id } = request.params
    if (!Object.prototype.hasOwnProperty.call(request, 'token')) {
        await response.status(403).send({ error: 'Token is missing' })
    }
    try {
        const { user } = request
        if (!user) {
            await response.status(401).send({ error: 'User not allowed to perform this operation' }).end()
        }
        const blog = await Blog.findOneAndDelete({ _id: id, user: user.id })
        if (!blog) {
            await response.status(404).send({ error: 'Blog not found or user not owner of blog' }).end()
        }
        console.log(blog)
        user.blogs = user.blogs.filter((b) => b.id !== blog.id)
        user.save()
        response.status(204).end()
    } catch (err) {
        next(err)
    }
})

// Update likes
blogRouter.put('/:id', middleware.userExtractor, async (request, response, next) => {
    const { id, likes } = request.body
    if (!Object.prototype.hasOwnProperty.call(request, 'token')) {
        await response.status(403).send({ error: 'Token is missing' })
    }
    try {
        const blog = await Blog.findByIdAndUpdate(id, { likes }, { new: true }).populate('user', { id: 1, name: 1, username: 1 })
        response.status(201).json(blog)
    } catch (err) {
        next(err)
    }
})

module.exports = blogRouter
