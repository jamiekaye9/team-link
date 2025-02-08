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
    title: {
        type: String,
        required: true
    },
    team: {
        type: String,
        required: true
    },
    manager: {
        type: String,
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    isManager: {
        type: Boolean
    }
})

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    workers: [workerSchema]
})

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    company: [companySchema]
})

const User = mongoose.model('User', userSchema)

module.exports = User