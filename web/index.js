const express = require('express')
const app = express()
const mongoose = require('mongoose')
const morgan = require('morgan')
const fileUpload = require('express-fileupload');
const cors = require('cors')
const NodeManager = require('./managers/NodeManager.js')
app.use(cors())
app.set('trust proxy', 1);
app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.set('view engine', 'ejs');
app.use('/static', express.static('public', {maxAge: 0}))
app.use(morgan('tiny'))
app.use(fileUpload({limits: { fileSize: 50 * 1024 * 1024 }}));

app.use(require('./routes'))
mongoose.connect(require('./config.json')["MONGO"], {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}, (mongoose)=>{
    console.log(`[WEB] Connected to the database `)
})

app.listen(80, ( ) => {
    console.log("[WEB] Listening on port 80")
    NodeManager.init()
})