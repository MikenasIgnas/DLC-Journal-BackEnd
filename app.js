const express = require("express")
const app = express()
const cors = require("cors")
const mongoose = require("mongoose")
const mainRouter = require("./modules/routes/router")

const bodyparser = require('body-parser')
mongoose.connect('mongodb://10.81.7.29:27017/')
    .then(() => {
        console.log('CONNECTED OK')
    }).catch(e => {
        console.log(e,'CONNECTION ERROR')
    })

app.use(cors({origin: 'http://localhost:3000', credentials: true, methods: "GET,HEAD,PUT,PATCH,POST,DELETE"}))
app.use(express.json())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: true, keepExtensions: true}));
app.listen(4000)
app.use("/", mainRouter)