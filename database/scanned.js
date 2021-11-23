const mongoose = require('mongoose')

const ScannedSchema = mongoose.Schema({
    id: {type: String, required: true},
    scannedOn: {type: Number, default: Date.now()},
    sumbitedOn: {type: Number, required: true, default: Date.now()},
    node: {type: Number, required: true},
    files: {type: Array, required: true},
    scanErrors: {type: Array}
})

module.exports=mongoose.model('scans', ScannedSchema)