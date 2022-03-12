const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const User = require('../models/user')

beforeEach(async () => {
    // Remove all Users in database
    await User.deleteMany({})
})

describe('User creation tests', () => {
    test('Create user successfully', async () => {
        const newUser = {
            name: 'New Name',
            username: 'newName@gmail.com',
            password: 'password',
        }

        const response = await api.post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const user = response.body
        expect(user).toMatchObject({
            name: 'New Name',
            username: 'newName@gmail.com',
        })

        const dbUser = await User.findById(user.id)
        expect(dbUser).toMatchObject({
            name: 'New Name',
            username: 'newName@gmail.com',
        })
    })

    test('Create user with wrong password or username', async () => {
        const shortUsernameUser = {
            name: 'New Name',
            username: 'ne',
            password: 'password',
        }
        const shortPassnameUser = {
            name: 'New Name',
            username: 'neasdas',
            password: 'pa',
        }

        const responseUsername = await api.post('/api/users')
            .send(shortUsernameUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const responsePassword = await api.post('/api/users')
            .send(shortPassnameUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(responseUsername.body.error).toEqual('Username must be larger than 3')
        expect(responsePassword.body.error).toEqual('Password must be larger than 3')
    })

    test('Create user 2 times with same username', async () => {
        const newUser = {
            name: 'New Name',
            username: 'newName@gmail.com',
            password: 'password',
        }

        await api.post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const response = await api.post('/api/users')
            .send(newUser)
            .expect(409)
            .expect('Content-Type', /application\/json/)

        expect(response.body.error).toContain('Error, expected `username` to be unique. Value:')
    })
})
