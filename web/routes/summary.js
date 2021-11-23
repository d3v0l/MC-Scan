const Router = require('express').Router()
const ForScanSchema = require('../../database/forscans')
const ScannedSchema = require('../../database/scanned')

Router.get("/", async (req, res) => {
    if(!req.query.id || req.query.id.length < 16) {
        return res.render('404.ejs')
    }
    let forSearch = await ForScanSchema.findOne({id: req.query.id})
    if(forSearch && forSearch.id === req.query.id) {
        return res.render("processing.ejs")
    }
    let scanned = await ScannedSchema.findOne({id: req.query.id})
    if(scanned.id === req.query.id) {
        console.log(scanned) 
        return res.render("summary.ejs", {scanned: scanned})
    }
})

module.exports=Router