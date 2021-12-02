const Router = require('express').Router()
const path = require('path')
Router.get('/', (req, res) => {
    res.render(path.join(__dirname+'/../views/index.ejs'))
})
Router.use('/scan', require('./scan'))
Router.use('/summary', require('./summary'))
Router.use('/upload', require('./upload'))
Router.use('/connect', require('./connect'))


Router.get('*', (req, res) => {
    res.render(path.join(__dirname+'/../views/404.ejs'))
})
module.exports=Router