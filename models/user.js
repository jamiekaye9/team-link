const mongoose = require('mongoose')


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
    companyId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null
    },
    admin: {
        type: Boolean,
        default: false
    }  
})

const User = mongoose.model('User', userSchema)
module.exports = User