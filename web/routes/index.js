const Router = require('express').Router()

Router.get('/', (req, res) => {
    res.render('index.ejs')
})
Router.use('/scan', require('./scan'))
Router.use('/summary', require('./summary'))
Router.get('*', (req, res) => {
    res.render('404.ejs')
})

module.exports = Router