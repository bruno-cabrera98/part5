const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('../utils/test_helper')

const initialState = [
    {
        title: 'Primer entrada',
        url: 'https://google.com',
        likes: 3,
    },
    {
        title: 'Segunda entrada',
        url: 'https://eva.fing.edu.uy',
        likes: 7,
    },
]

beforeEach(async () => {
    // Remove all blogs in database
    await Blog.deleteMany({})
    await User.deleteMany({})
    const blogs = initialState.map((blog) => new Blog(blog))
    await Promise.all(blogs.map((blog) => blog.save()))
})

describe('Blog list tests', () => {
    test('Get blogs', async () => {
        const response = await api.get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toHaveLength(initialState.length)
        expect(response.body.map((blog) => blog.title)).toContainEqual('Primer entrada')
    })

    test('Blogs with correct id', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body.every((blog) => 'id' in blog && !('_id' in blog))).toBe(true)
    })
})

describe('Blog creation tests', () => {
    test('Correct creation', async () => {
        const token = await helper.createAndLogin(api, 'masa', 'masa')

        const newBlog = {
            title: 'Nuevo blog',
            url: 'https://eva.ecu.edu.uy',
            likes: 2,
        }

        const responseBlog = await api.post('/api/blogs')
            .set('authorization', `bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(responseBlog.body).toMatchObject(newBlog)

        const response = await api.get('/api/blogs')

        expect(response.body.find((blog) => blog.title === 'Nuevo blog'))
            .toMatchObject(newBlog)
    })

    test('Likes default to zero', async () => {
        const token = await helper.createAndLogin(api, 'masa', 'masa')
        const newBlog = {
            title: 'Blog con cero likes',
            url: 'https://eva.ecu.edu.uy',
        }

        const responseBlog = await api.post('/api/blogs')
            .set('authorization', `bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(responseBlog.body.likes).toEqual(0)
    })

    test('If no title or url returns bad request', async () => {
        const noTitleBLog = {
            url: 'https://eva.ecu.edu.uy',
        }

        const noUrlBlog = {
            title: 'Blog con cero likes',
        }

        const noTitleNorUrlBlog = {
        }

        const token = await helper.createAndLogin(api, 'masa', 'masa')
        await api.post('/api/blogs')
            .set('authorization', `bearer ${token}`)
            .send(noTitleBLog)
            .expect(400)

        await api.post('/api/blogs')
            .set('authorization', `bearer ${token}`)
            .send(noUrlBlog)
            .expect(400)

        await api.post('/api/blogs')
            .set('authorization', `bearer ${token}`)
            .send(noTitleNorUrlBlog)
            .expect(400)
    })

    test('No token provided returns unauthorized', async () => {
        const newBlog = {
            title: 'Nuevo blog',
            url: 'https://eva.ecu.edu.uy',
            likes: 2,
        }

        await api.post('/api/blogs')
            .send(newBlog)
            .expect(401)
            .expect('Content-Type', /application\/json/)
    })
})
