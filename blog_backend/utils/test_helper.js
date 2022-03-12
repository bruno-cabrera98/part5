const createAndLogin = async (api, username, password) => {
    await api.post('/api/users')
        .send({ username, password, name: 'name' })
        .expect(200)
    const response = await api.post('/api/login')
        .send({ username, password })
        .expect(200)
    return response.body.token
}

module.exports = { createAndLogin }
