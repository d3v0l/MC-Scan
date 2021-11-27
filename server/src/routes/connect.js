const Router = require('express').Router()
const config = require('../../config.json')
const fs = require('fs')
Router.get('/', (req, res) => {
    return res.send({
        status: {
            online: true,
            error: false,
            success: true,
            message: "SUCCESS",
            code: 200
        }
    })
})
Router.post('/', (req, res) => {
    if(!req.query || !req.query.node || !req.query.secret) {
        return res.send({
            status: {
                success: false,
                error: true,
                message: "INVALID_QUERY",
                code: 400,
            }
        })
    }
    const {node, secret} = req.query
    if(config["SECRET"] !== secret){
        return res.send({
            status: {
                success: false,
                error: true,
                message: "INVALID_SECRET",
                code: 401,
            }
        })
    }
    config["NODE"] = String(node)
    fs.writeFileSync(`${__dirname}/../../config.json`, JSON.stringify(config, null, 4))
    return res.send({
        status: {
            online: true,
            success: true,
            error: false,
            message: "SUCCESS",
            code: 200
        }
    })
})

module.exports=Router