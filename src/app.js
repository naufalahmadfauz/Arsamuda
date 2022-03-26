require('./db/mongoose')
const express = require('express')
const userRouter = require('./routers/user')
const homeRouter = require('./routers/home')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')
// const methodOverride = require('method-override')

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
app.use(express.urlencoded({extended: false}))


app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized:true,
    cookie: {
        maxAge: 300000,
        sameSite:'lax'
    },
    resave: false,
    store:MongoStore.create({
        mongoUrl : process.env.MONGODB_URL
    })
}));
app.use(flash())
app.use(homeRouter)
app.use(userRouter)

module.exports = app