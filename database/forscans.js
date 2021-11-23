let mongoose = require('mongoose')

let ForScans = mongoose.Schema({
    id: {type: String, required: true},
    submitedOn: {type: Number, required: true, default: Date.now()},
    node: {type: String, required: true},
    recieved: {type: Boolean}
})

module.exports=mongoose.model('forscans', ForScans)