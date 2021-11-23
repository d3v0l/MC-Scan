const Router = require('express').Router()

Router.get('/', (req, res) => {
    res.send({
        status: {
            success: true,
            message: "SUCCESS",
            error: false,
            code: 200,
        }
    })
})
Router.use('/upload', require('./upload'))
Router.use('/connect', require('./connect'))
module.exports=Router