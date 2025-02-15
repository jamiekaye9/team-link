const dotenv = require('dotenv')
dotenv.config()
const path = require('path')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const MongoStore = require('connect-mongo');
const session = require('express-session')
const methodOverride = require('method-override')


const PORT = process.env.port || 3005

mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connnected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}`);
})

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            collectionName: 'sessions',
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
        }
    })
)

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    if (req.session.user) {
        const companyId = req.session.user.companyId
        return res.redirect(`/company/${companyId}`)
    }
    const user = req.session.user
    res.render('index.ejs', {user})
})

app.get('/error', (req, res) => {
    req.session.destroy()
    res.render('error.ejs')
})

const authController = require('./controllers/auth')
app.use('/auth', authController)

const isSignedIn = require('./middleware/is-signed-in')
app.use(isSignedIn)

const companyController = require('./controllers/company')
app.use('/company', companyController) 


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

module.exports = app


