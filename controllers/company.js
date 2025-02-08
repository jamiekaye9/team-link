const express = require('express')
const router = express.Router()
const User = require('../models/user.js')

router.get('/', async (req, res) => {
    const companyName = req.session.user.company.companyName
    const companyId = req.session.user.company._id
    const user = await User.findOne({ 'company._id': companyId})
    const workers = user.company.workers || []
    res.render('company/index.ejs', {companyName: companyName, workers})
})

router.get('/add-worker', (req, res) => {
    res.render('company/add-worker.ejs')
})

router.post('/add-worker', async (req, res) => {
    if (req.body.isManager === 'on') {
        req.body.isManager = true
    } else {
        req.body.isManager = false
    }
    const userId = req.session.user._id
    const user = await User.findById(userId)
    const newWorker = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        title: req.body.title,
        team: req.body.team,
        manager: req.body.manager,
        salary: req.body.salary,
        isManager: req.body.isManager
    }
    user.company.workers.push(newWorker)
    await user.save()
    return res.redirect('/company/')
})

module.exports = router