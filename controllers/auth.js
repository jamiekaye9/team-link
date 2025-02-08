const express = require('express')
const router = express.Router()
const User = require('../models/user.js')
const bcrypt = require('bcrypt')

const runQueries = async () => {
    await createCompany()
}

router.get('/sign-up', (req, res) => {
    res.render('auth/sign-up.ejs')
})

router.post('/sign-up', async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username })
    if (userInDatabase) {
        return res.send('Username already taken')
    }
    if (req.body.password !== req.body.confirmPassword) {
        return res.send('Password and Confirm Password must match')
    }
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)
    req.body.password = hashedPassword
    const user = await User.create(req.body)
    req.session.user = {
        username: user.username,
        _id: user._id
    }
    res.render('auth/company.ejs')
})

router.get('/sign-in', (req, res) => {
    res.render('auth/sign-in.ejs')
})

router.post('/sign-in', async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username })
    if (!userInDatabase) {
        return res.send('Login failed. Please try again')
    }
    const validPassword = bcrypt.compareSync(
        req.body.password,
        userInDatabase.password
    )
    if (!validPassword) {
        return res.send('Login failed. Please try again')
    }
    req.session.user = {
        username: userInDatabase.username,
        _id: userInDatabase._id
    }
    res.redirect('/')
})

router.get('/sign-out', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

router.get('/company', (req, res) => {
    res.render('auth/company.ejs')
})

router.post('/create-company', async (req, res) => {
    const companyInDatabase = await User.findOne({ companyName: req.body.companyName })
    if (companyInDatabase) {
        return res.send('Company name has been taken')
    }
    if (req.body.password !== req.body.confirmPassword) {
        return res.send('Password and Confirm Password must match')
    }
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)
    req.body.password = hashedPassword
    const userId = req.session.user._id
        const user = await User.findById(userId)
        const companyData = {
            companyName: req.body.companyName,
            password: req.body.password
        }
        user.company.push(companyData)
        await user.save()
    res.send('Request to create a company received')
})

router.post('/join-company', async (req, res) => {
    const companyInDatabase = await User.findOne({
        company: { $elemMatch: { companyName: req.body.companyName }}
    })
    if (!companyInDatabase) {
        return res.send('Company does not exist')
    }
    const validPassword = bcrypt.compareSync(
        req.body.password,
        companyInDatabase.password
    )
    if (!validPassword) {
        return res.send('Password incorrect')
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10)
    req.body.password = hashedPassword

    const userId = req.session.user._id
        const user = await User.findById(userId)
        const companyData = {
            companyName: req.body.companyName,
            password: req.body.password
        }
        user.company.push(companyData)
        await user.save()
    res.send('You have joined the company')
})

module.exports = router

