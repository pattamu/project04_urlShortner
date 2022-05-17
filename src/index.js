const express = require('express')
const mongoose = require('mongoose')
const app = express()
const bodyParser = require('body-parser')
const route = require('./router/router.js')
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

mongoose.connect("mongodb+srv://pattamu:bqPvauaKLfc6SIBP@cluster0.eqx53.mongodb.net/group61database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use(route)

app.listen(port, (err) => {
    console.log("connected to port: " + port)
})