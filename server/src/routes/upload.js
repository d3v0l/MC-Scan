const Router = require('express').Router()
const fs = require('fs')
const fsExtra = require('fs-extra')
const path = require('path')
const { unzip } = require('../scanner')
const rateLimit = require("express-rate-limit");
const ForScans = require('../../../database/forscans.js')
const {customAlphabet} = require('nanoid')
const nanoid = customAlphabet("1234567890", 16)

Router.get('/', (req, res) => {
    res.send({
        status: {
            success: false,
            error: true,
            message: "INVALID_REQUEST_METHOD",
            code: 400,
        }
    })
})
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1
});
Router.post('/', limiter, async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.send({
            status: {
                success: false,
                error: true,
                message: "NO_FILE_PROVIDED",
                code: 400,
            }
        })
    }
    if(!(new RegExp(`(zip|jar)`).test(req.files.file.name))){
        return res.send({
            status: {
                success: false,
                error: true,
                message: "INVALID_FILE",
                code: 400,
            }
        })
    }
    let forScan = new ForScans({
        id: nanoid()
    })
    let file = req.files.file
    let folder = await fs.mkdirSync(path.join(`${__dirname}/../../storage/${forScan.id}`), {recursive: true})
    let pth = path.join(`${folder}/${file.name}`)
    file.mv(pth, async function(err) {
        if (err) {
            //res.status(500) could not set because Axios fails to handle it and you need to catch it.Error: Invalid or unsupported zip format. No END header found
            return res.json({
                status: {
                    success: false,
                    error: true,
                    message: "SOMETHING_WENT_WRONG",
                    code: 500
                }
            })
        }
        let ext = file.name.split('.')
        if(ext[ext.length-1] === 'zip'){
            let responseUnzip = await unzip(pth, folder)
            if(responseUnzip) {
                fs.unlinkSync(pth)
                new Promise((resolve, reject) => {
                    forScan.save()
                    .then(doc => resolve(doc))
                    .catch(e => reject(e))
                })
                .then(doc => {
                    res.json({
                        status: {
                            error: false,
                            success: true,
                            message: "SUCCESS",
                            code: 200
                        },
                        link: `${require('../../config.json')["URL"]}/summary?id=${doc.id}`
                    })
                })
                
            } else {
                //res.status(500) could not set because Axios fails to handle it and you need to catch it.Error: Invalid or unsupported zip format. No END header found
                res.json({
                    status: {
                        error: true,
                        success: false,
                        message: "SOMETHING_WENT_WRONG",
                        code: 500
                    }
                })
                fsExtra.emptyDirSync(folder)
                fsExtra.removeSync(folder)
            }
        } else {
            new Promise((resolve, reject) => {
                forScan.save()
                .then(doc => resolve(doc))
                .catch(err => reject(err))
            })
            .then(doc => {
                console.log(doc)
                res.json({
                    status: {
                        error: false,
                        success: true,
                        message: "SUCCESS",
                        code: 200
                    },
                    link: "https://mc-scan.ga/summary?id="+doc.id
                })
            })
            .catch(e => {
                console.log(e)
                res.json({
                    status: {
                        error: true,
                        success: false,
                        message: "SOMETHING_WENT_WRONG",
                        code: 500
                    }
                })
            })
            
        }
    });
})


module.exports=Router