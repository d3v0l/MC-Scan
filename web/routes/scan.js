const Router = require('express').Router()
const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet("1234567890", 16)
const ForScanSchema = require('../../database/forscans.js')
const NodeManager = require('../managers/NodeManager')
const rateLimit = require("express-rate-limit");

Router.get('/', (req, res) => {
    res.render('scan.ejs')
})
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1
});
Router.post("/", limiter, (req, res) => {
    if(!req.body.file || req.body.file.length < 1) { 
        return res.send({
            status: {
                success: false,
                error: true,
                message: "NO_FILE_PROVIDED",
                code: 400
            }
        })
    }
    let fileSplit = req.body.file.split('.')
    if(fileSplit[fileSplit.length-1] !== "zip" && fileSplit[fileSplit.length-1] !== "jar") { 
        return res.send({
            status: {
                success: false,
                error: true,
                message: "INVALID_FILE",
                code: 400
            }
        })
    }
    let data = {
        id: nanoid(),
        node: NodeManager.getNode()
    }
    let save = new ForScanSchema({
        id: data.id,
        node: "1"
    })
    save.save()
    .then(r => {
        res.send({
            status:{
                success: true,
                error: false,
                message: "SUCCESS",
                code: 200
            },
            link: `${data.node.host}/upload?id=${data.id}`
        })
    })
    .catch(e => console.log(e))
    
})

module.exports=Router