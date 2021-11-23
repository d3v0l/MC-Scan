const express = require('express')
const app = express()
const mongoose = require('mongoose')
const morgan = require('morgan')
const fileUpload = require('express-fileupload');
const Scanner = require('./scanner');
const cors = require('cors')
app.use(cors())
app.set('trust proxy', 1);
app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.set('view engine', 'ejs');
app.use('/static', express.static('public'))
app.use(morgan('tiny'))
app.use(fileUpload({limits: { fileSize: 50 * 1024 * 1024 }}));

app.use(require('./routes'))

mongoose.connect(require('../config.json')["MONGO"], {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}, (mongoose)=>{
    console.log(`[Node] Connected to the database `)
    Scanner.init()
})

app.listen(require('../config.json')["PORT"], () => { 
    console.log("[Node] Started listening on port "+require('../config.json')["PORT"]) 
    
})