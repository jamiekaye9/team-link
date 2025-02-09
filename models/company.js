const mongoose = require('mongoose')

const workerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    team: {
        type: String,
        required: true
    },
    manager: {
        type: String,
        required: false
    },
    salary: {
        type: Number,
        required: true
    },
    isManager: {
        type: Boolean,
        default: false
    }
})

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    workers: [workerSchema]
})

const Company = mongoose.model('Company', companySchema)
module.exports = Company