const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Company = require('../models/company')
const User = require('../models/user')

router.get('/:id', async (req, res) => {
    const companyId = req.params.id
    const company = await Company.findById(companyId)
    const companyName = company.companyName
    let workers = company.workers.map(worker => {
        if (!worker.manager) {
            return { ...worker.toObject(), manager: "None" }; 
        }
        const manager = company.workers.id(worker.manager);
        return {
            ...worker.toObject(), 
            manager: manager ? `${manager.firstName} ${manager.lastName}` : "None"
        };
    });
    const user = req.session.user
    res.render('company/my-company.ejs', {companyId, companyName, workers, user})
})

router.get('/:id/add-worker', async (req, res) => {
    const companyId = req.params.id
    const company = await Company.findById(companyId)
    const companyName = company.companyName
    const user = req.session.user
    let managers = company.workers
    managers = managers.filter(manager => manager.isManager === true)
    res.render('company/add-worker.ejs', {companyId, managers, companyName, user})
})

router.post('/:id/add-worker', async (req, res) => {
    try {
        const companyId = req.params.id
        if (req.body.isManager === 'on') {
            req.body.isManager = true
        } else {
            req.body.isManager = false
        }
        if (req.body.manager === '') {
            req.body.manager = null
        } else {
            req.body.manager = new mongoose.Types.ObjectId(req.body.manager.toString())
        }
        const company = await Company.findById(companyId)
        company.workers.push(req.body)
        await company.save()
        res.redirect(`/company/${companyId}`)
    } catch(error) {
        console.log(error);
        
        res.redirect('/error')
    }
})

router.get('/:id/teams', async (req, res) => {
    const companyId = req.session.user.companyId
    const company = await Company.findById(companyId)
    const companyName = company.companyName
    const user = req.session.user
    const workers = company.workers
    const teams = [...new Set(company.workers.map(worker => worker.team))]
    res.render('company/teams.ejs', {companyId, teams, companyName, workers, user})
})

router.get('/:id/finances', async (req, res) => {
    const companyId = req.session.user.companyId
    const company = await Company.findById(companyId)
    const companyName = company.companyName
    const user = req.session.user
    let allSalaries = []
    let totalSalary = 0
    company.workers.forEach(worker => {
        allSalaries.push(worker.salary)
    })
    allSalaries.forEach(salary => {
        totalSalary += salary
    })
    const averageSalary = Math.round(totalSalary/allSalaries.length)
    const highestSalary = Math.max(...allSalaries)
    const lowestSalary = Math.min(...allSalaries)
    res.render('company/finances.ejs', {totalSalary, companyId, companyName, averageSalary, highestSalary, lowestSalary, user})
})

router.get('/:companyid/users', async (req, res) => {
    const companyId = req.params.companyid
    const company = await Company.findById(companyId)
    const companyName = company.companyName
    const user = req.session.user
    const companyUsers = await User.find({companyId})
    res.render('company/users.ejs', {companyId, companyName, user, companyUsers})
})

router.get('/:companyid/:workerid', async (req, res) => {
    const companyId = req.params.companyid   
    const workerId = req.params.workerid
    const user = req.session.user
    const company = await Company.findById(companyId)
    let worker = company.workers.id(workerId)
    const manager = company.workers.id(worker.manager)
    if (!worker.manager) {
        worker = {...worker.toObject(), manager: "None"};
    } else {
        worker = {...worker.toObject(), manager: `${manager.firstName} ${manager.lastName}`};
    }
    const companyName = company.companyName
    res.render('company/show.ejs', {worker, companyId, companyName, user})
})

router.get('/:companyid/:workerid/edit', async (req, res) => {
    const companyId = req.params.companyid
    const workerId = req.params.workerid
    const company = await Company.findById(companyId)
    const companyName = company.companyName
    const user = req.session.user
    const worker = company.workers.id(workerId)
    let managers = company.workers
    managers = managers.filter(manager => manager.isManager === true)
    res.render('company/edit-worker.ejs', {companyId, worker, managers, companyName, user})
})

router.put('/:companyid/:workerid', async (req, res) => {
    try {
        const newFirstName = req.body.firstName
        const newLastName = req.body.lastName
        const newJobTitle = req.body.jobTitle
        const newTeam = req.body.team
        if (req.body.manager === '') {
            req.body.manager = null
        } else {
            req.body.manager = new mongoose.Types.ObjectId(req.body.manager.toString())
        }
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
    } catch(error) {
        console.log(error);
        res.redirect('/error')
    }
})

router.delete('/:companyid/:workerid', async (req, res) => {
    const companyId = req.params.companyid
    const workerId = req.params.workerid
    const company = await Company.findById(companyId)
    company.workers.forEach(worker => {
        if (worker.manager && worker.manager.toString() === workerId) {
            worker.manager = null;
        }
    })
    company.workers.pull({_id: workerId})
    await company.save()
    res.redirect(`/company/${companyId}`)
})

module.exports = router