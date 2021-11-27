let mongoose = require('mongoose')

let ForScans = mongoose.Schema({
    id: {type: String, required: true},
    submitedOn: {type: Number, required: true, default: Date.now()},
    node: {type: String, required: true},
    recieved: {type: Boolean, default: false}
})

module.exports=mongoose.model('forscans', ForScans)