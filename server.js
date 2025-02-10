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

const PORT = process.env.port || 3005

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
    const companyId = req.params.id
    const company = await Company.findById(companyId)
    const companyName = company.companyName
    const workers = company.workers
    res.render('company/my-company.ejs', {companyId, companyName, workers})
})
app.get('/company/:id/add-worker', async (req, res) => {
    const companyId = req.params.id
    const company = await Company.findById(companyId)
    let managers = company.workers
    managers = managers.filter(manager => manager.isManager === true)
    res.render('company/add-worker.ejs', {companyId, managers})
})

app.post('/company/:id/add-worker', async (req, res) => {
    try {
        if (req.body.isManager === 'on') {
            req.body.isManager = true
        } else {
            req.body.isManager = false
        }
        if (req.body.manager === 'None') {
            req.body.manager = null
        }
        const companyId = req.params.id
        console.log(companyId);
        const company = await Company.findById(companyId)
        company.workers.push(req.body)
        await company.save()
        res.redirect(`/company/${companyId}`)
    } catch(error) {
        console.log(error)
        res.redirect('/error')
    }
})

app.get('/company/:id/teams', async (req, res) => {
    const companyId = req.session.user.companyId
    const company = await Company.findById(companyId)
    const teams = [...new Set(company.workers.map(worker => worker.team))]
    res.render('company/teams.ejs', {companyId, teams})
})

app.get('/company/:id/finances', async (req, res) => {
    const companyId = req.session.user.companyId
    const company = await Company.findById(companyId)
    let allSalaries = []
    let totalSalary = 0
    company.workers.forEach(worker => {
        allSalaries.push(worker.salary)
    })
    allSalaries.forEach(salary => {
        totalSalary += salary
    })
    res.render('company/finances.ejs', {totalSalary})
})

app.get('/company/:companyid/:workerid', async (req, res) => {
    const workerId = req.params.workerid
    const worker = Company.findOne({workerId})
    // console.log(worker);
    
    res.render('company/show.ejs', {worker})
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})


