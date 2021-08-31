const express = require('express')
const homeRouter = require('./routers/home')

const userRouter = require('./routers/user')
// require('./db/mongoose')

const hbs = require('hbs')
const path = require("path");

const viewsPath = path.join(__dirname, '../templates/views')
const publicDirectoryPath = path.join(__dirname, '../public')


const app = express()


app.use(express.static(publicDirectoryPath))

app.set('views',viewsPath)
app.set('view engine', 'hbs')

app.use(express.json())
// app.use(userRouter)
app.use(homeRouter)

module.exports = app