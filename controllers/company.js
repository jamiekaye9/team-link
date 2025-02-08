const express = require('express')
const router = express.Router()
const User = require('../models/user.js')

router.get('/my-company', (req, res) => {
    res.render('company/index.ejs')
} )

module.exports = router