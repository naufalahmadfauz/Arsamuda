require('./db/mongoose')
const express = require('express')
const userRouter = require('./routers/user')
const homeRouter = require('./routers/home')
const session = require('express-session')
const methodOverride = require('method-override')
// const MongoStore = require('connect-mongo')(session)

const hbs = require('hbs')
const path = require("path");

const viewsPath = path.join(__dirname, '../templates/views')
const vartialsPath = path.join(__dirname, '../templates/partials')
const publicDirectoryPath = path.join(__dirname, '../public')


const app = express()


app.use(express.static(publicDirectoryPath))

app.set('views',viewsPath)
app.set('view engine', 'hbs')
hbs.registerPartials(vartialsPath)

app.use(express.json())
app.use(userRouter)
app.use(homeRouter)

module.exports = app