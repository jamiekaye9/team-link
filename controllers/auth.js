const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Company = require('../models/company')

router.get('/signup', (req, res) => {
    res.render('auth/sign-up.ejs')
})

router.get('/signin', (req, res) => {
    res.render('auth/sign-in.ejs')
})

router.post('/signup', async (req, res) => {
    try {
        const firstName = req.body.firstName
        const lastName = req.body.lastName
        const username = req.body.username
        const existingUser = await User.findOne({username})
        if (existingUser) {
            return res.redirect('/error')
        }
        const password = req.body.password
        const confirmPassword = req.body.confirmPassword
        if (password !== confirmPassword) {
            return res.redirect('/error')
        }
        const hashedPassword = await bcrypt.hashSync(password, 10)
        await User.create({firstName, lastName, username, password: hashedPassword})
        res.redirect('/auth/signin')
    } catch(error) {
        console.log(error)
        res.redirect('/error') 
    }
})

router.post('/signin', async (req, res) => {
    try {
        const username = req.body.username
        const existingUser = await User.findOne({username})
        if (!existingUser) {
            return res.redirect('/error')
        }
        const password = req.body.password
        const isPasswordValid = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordValid) {
            return res.redirect('/error')
        }
        req.session.user = {
            username: existingUser.username,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            companyId: existingUser.companyId,
            id: existingUser._id
        }
        if (req.session.user.companyId === null) {
            return res.redirect('/auth/choose-company')
        }
        res.redirect(`/company/${req.session.user.companyId}`)
    } catch(error) {
        console.log(error)
        res.redirect('/error')  
    }
})

router.get('/choose-company', (req, res) => {
    res.render('auth/choose-company.ejs')
})

router.get('/create-company', (req, res) => {
    res.render('auth/create-company.ejs')
})

router.post('/create-company', async (req, res) => {
    try {
        const companyName = req.body.companyName
        const existingCompany = await Company.findOne({companyName})
        if (existingCompany) {
            return res.redirect('/error')
        }
        const password = req.body.password
        const confirmPassword = req.body.confirmPassword
        if (password !== confirmPassword) {
            return res.redirect('/error')
        }
        const hashedPassword = await bcrypt.hashSync(password, 10)
        await Company.create({companyName, password: hashedPassword})
        const company = await Company.findOne({companyName})
        const user = await User.findById(req.session.user.id)
        user.companyId = company._id
        user.admin = true
        await user.save()
        req.session.user.companyId = company._id
        res.redirect(`/company/${company._id}`)
    } catch(error) {
        console.log(error)
        res.redirect('/error') 
    }
})

router.get('/join-company', (req, res) => {
    res.render('auth/join-company.ejs')
})

router.post('/join-company', async (req, res) => {
    try {
        const companyName = req.body.companyName
        const existingCompany = await Company.findOne({companyName})
        if (!existingCompany) {
            return res.redirect('/error')
        }
        const password = req.body.password
        const isPasswordValid = await bcrypt.compare(password, existingCompany.password)
        if (!isPasswordValid) {
            return res.redirect('/error')
        }
        const user = await User.findById(req.session.user.id)
        user.companyId = existingCompany._id
        await user.save()
        req.session.user.companyId = existingCompany._id
        res.redirect(`/company/${existingCompany._id}`)
    } catch(error) {
        console.log(error)
        res.render('/error')  
    }
})

router.get('/signout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

module.exports = router