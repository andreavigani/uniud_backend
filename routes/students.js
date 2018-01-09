var express = require('express')
var router = express.Router()
var crypto = require('crypto')

var Student = require('../models/student')

//Middleware that generates salt and calculates password hash
router.post('/', function(req,res,next){
    if (!req.body.password)
        return res.status(422).json({message: 'Missing password'})
    req.body.salt = crypto.randomBytes(64).toString('base64')
    var password_hash = crypto.createHash('sha256').update(req.body.password + req.body.salt).digest('base64')
    delete req.body.password
    req.body.password_hash = password_hash
    next()
});

//Infer other non-specified routes
router.use('/', require('./generic_router')('student', {path: 'study_plan', select: ['name']}))

module.exports = router