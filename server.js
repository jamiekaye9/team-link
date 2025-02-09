const dotenv = require('dotenv')
dotenv.config()
const path = require('path')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const session = require('express-session')
const User = require('./models/user')
const Company = require('./models/company')

const PORT = process.env.port || 3004

mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connnected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}`);
})

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true
    })
)

app.get('/', (req, res) => {
    const user = req.session.user
    res.render('index.ejs', {user})
})

app.get('/error', (req, res) => {
    res.render('error.ejs')
})

const authController = require('./controllers/auth')
app.use('/auth', authController)

app.get('/company/:id', async (req, res) => {
    const userId = req.session.user.id
    const user = await User.findById(userId)
    const company = await Company.findOne(user.companyId)
    console.log(company);
    const companyName = company.companyName
    res.render('company/my-company.ejs', {companyName})
})

app.get('/company/:id/add-worker', (req, res) => {
    const companyId = req.session.user.companyId
    res.render('company/add-worker.ejs', companyId)
})

app.post('/company/:id/add-worker', async (req, res) => {
    if (req.body.isManager === 'on') {
        req.body.isManager = true
    } else {
        req.body.isManager = false
    }
    const company = await Company
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const jobTitle = req.body.jobTitle
    const team = req.body.team
    const manager = req.body.manager
    const salary = req.body.salary

})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

