const express = require('express')
const app = express()
const mongoose = require('mongoose')
const morgan = require('morgan')
const fileUpload = require('express-fileupload');
const cors = require('cors')
const NodeManager = require('./managers/NodeManager.js')
const path = require('path');
app.use(cors())
app.set('trust proxy', 1);
app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname+'/public'), {maxAge: 0}))
app.use(morgan('[WEB] :method :url :status :res[content-length] - :response-time ms'))
app.use(fileUpload({limits: { fileSize: 50 * 1024 * 1024 }}));

app.use(require('./routes'))
mongoose.connect(require('./config.json')["MONGO"], {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}, (err)=>{
    if(err) { 
        console.log(err)
        process.exit(1)
    }
    console.log(`[WEB] Connected to the database `)
})

app.listen(require('./config.json')["PORT"], () => {
    console.log("[WEB] Listening on port 80")
    NodeManager.init()
})