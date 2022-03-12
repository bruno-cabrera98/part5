const _ = require('lodash')

const dummy = () => 1

const totalLikes = (blogs) => blogs.reduce((acc, curr) => acc + curr.likes, 0)

const favoriteBlog = (blogs) => blogs.reduce((max, curr) => (max.likes < curr.likes
    ? curr
    : max), blogs.shift() || null)

const mostBlogs = (blogs) => {
    const maxAuthor = _(blogs)
        .groupBy((blog) => blog.author)
        .toPairs()
        .maxBy((author) => author[1].length)
    return maxAuthor && {
        author: maxAuthor[0],
        blogs: maxAuthor[1].length,
    }
}

const mostLikes = (blogs) => {
    const bestAuthor = _(blogs)
        .groupBy((blog) => blog.author)
        .toPairs()
        .maxBy((author) => _(author[1]).sumBy('likes'))
    return bestAuthor && {
        author: bestAuthor[0],
        likes: _(bestAuthor[1]).sumBy('likes'),
    }
}

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}
