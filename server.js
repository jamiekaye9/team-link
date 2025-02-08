const dotenv = require('dotenv')
dotenv.config()
const express = require('express')

const mongoose = require('mongoose')
const methodOverride = require('method-override')
const morgan = require('morgan')
const session = require('express-session')
const isSignedIn = require('./middleware/is-signed-in.js')
const passUserToView = require('./middleware/pass-user-to-view.js')

const app = express()



const port = process.env.PORT ? process.env.PORT: '3002'

const authController = require('./controllers/auth.js')
const companyController = require('./controllers/company.js')


mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}`);
})

app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(morgan('dev'))
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    })
)

app.use(passUserToView)

app.get('/', async (req, res) => {
    res.render('index.ejs', {
        user: req.session.user
    })
})

app.use('/auth', authController)
app.use(isSignedIn)
// app.use('/users/:userId/company', companyController)
app.use('/company', companyController)

app.listen(port, () => {
    console.log(`Listening on Port: ${port}`);  
})

