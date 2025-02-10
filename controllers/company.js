const express = require('express')
const router = express.Router()
const Company = require('../models/company')

router.get('/:id', async (req, res) => {
    const companyId = req.params.id
    const company = await Company.findById(companyId)
    const companyName = company.companyName
    const workers = company.workers
    res.render('company/my-company.ejs', {companyId, companyName, workers})
})
router.get('/:id/add-worker', async (req, res) => {
    const companyId = req.params.id
    const company = await Company.findById(companyId)
    const companyName = company.companyName
    let managers = company.workers
    managers = managers.filter(manager => manager.isManager === true)
    res.render('company/add-worker.ejs', {companyId, managers, companyName})
})

router.post('/:id/add-worker', async (req, res) => {
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

router.get('/:id/teams', async (req, res) => {
    const companyId = req.session.user.companyId
    const company = await Company.findById(companyId)
    const companyName = company.companyName
    const teams = [...new Set(company.workers.map(worker => worker.team))]
    res.render('company/teams.ejs', {companyId, teams, companyName})
})

router.get('/:id/finances', async (req, res) => {
    const companyId = req.session.user.companyId
    const company = await Company.findById(companyId)
    const companyName = company.companyName
    let allSalaries = []
    let totalSalary = 0
    company.workers.forEach(worker => {
        allSalaries.push(worker.salary)
    })
    allSalaries.forEach(salary => {
        totalSalary += salary
    })
    res.render('company/finances.ejs', {totalSalary, companyId, companyName})
})

router.get('/:companyid/:workerid', async (req, res) => {
    const companyId = req.params.companyid   
    const workerId = req.params.workerid
    const company = await Company.findById(companyId)
    const companyName = company.companyName
    const worker = company.workers.id(workerId)
    res.render('company/show.ejs', {worker, companyId, companyName})
})

router.get('/:companyid/:workerid/edit', async (req, res) => {
    const companyId = req.params.companyid
    const workerId = req.params.workerid
    const company = await Company.findById(companyId)
    const companyName = company.companyName
    const worker = company.workers.id(workerId)
    let managers = company.workers
    managers = managers.filter(manager => manager.isManager === true)
    res.render('company/edit-worker.ejs', {companyId, worker, managers, companyName})
})

router.put('/:companyid/:workerid', async (req, res) => {
    const newFirstName = req.body.firstName
    const newLastName = req.body.lastName
    const newJobTitle = req.body.jobTitle
    const newTeam = req.body.team
    const newManager = req.body.manager
    const newSalary = req.body.salary
    const newIsManager = req.body.isManager
    const companyId = req.params.companyid
    const workerId = req.params.workerid
    const company = await Company.findById(companyId)
    const worker = company.workers.id(workerId)
    worker.firstName = newFirstName
    worker.lastName = newLastName
    worker.jobTitle = newJobTitle
    worker.team = newTeam
    worker.manager = newManager
    worker.salary = newSalary
    worker.isManager = newIsManager
    await company.save()
    res.redirect(`/company/${companyId}/${workerId}`)
})

router.delete('/:companyid/:workerid', async (req, res) => {
    const companyId = req.params.companyid
    const workerId = req.params.workerid
    const company = await Company.findById(companyId)
    company.workers.pull({_id: workerId})
    await company.save()
    res.redirect(`/company/${companyId}`)
})

module.exports = router