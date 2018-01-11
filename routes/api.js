var express = require('express')
var router = express.Router()
var crypto = require('crypto')
var https = require('https')
var pluralize = require('pluralize')
//Dialog Flow Route
router.use('/dialogflow', require('./dialogflow'))

//Generic Routes
var schemas = ['classroom', 'exam_grade', 'exam_session_enrollment', 'exam_time', 'fee', 'notice', 'teacher']
schemas.forEach(model_name => {
    router.use('/' + pluralize(model_name), require('./generic_router')(model_name))
});

//Specific Routes
router.use('/courses', require('./generic_router')('course', {path: 'study_plans', select: ['name']}))
router.use('/study_plans', require('./generic_router')('study_plan', [{path: 'course', select: 'name'}, {path: 'exams', select: ['name']}, {path: 'optional_exams', select: ['name']}]))

router.use('/exams', require('./generic_router')('exam', {path: 'teachers', select: ['name', 'lastname']}))
router.use('/exam_sessions', require('./generic_router')('exam_session', {path: 'exam_id', select: 'name'}))

router.use('/students', require('./students'))

var Student = require('../models/student')

//--Login
var Session = require('../models/session')

router.post('/login/:validation_secret', function (req, res) {
    console.log(req.body)
    Student.findOne({ 'id_number': req.body.id_number }).
        exec(function (err, student) {
            if (err || !student) {
                return res.status(401).json('Accesso negato.')
            }
            var password_hash = crypto.createHash('sha256').update(req.body.password + student.salt).digest('base64')
            if (password_hash !== student.password_hash) return res.status(401).json('Accesso negato.')

            Session.findOne({ 'validation_secret': req.params.validation_secret }).exec(function (err, session) {
                if (err || !session) return res.status(400).json('Token di accesso non trovato.')

                session.id_number = student.id_number
                session.save()

                //Post-login welcome message
                const postData = JSON.stringify({
                    'chat_id': session.user_id,
                    'text': 'Benvenuto ' + student.name + '!'
                })

                const options = {
                    hostname: 'api.telegram.org',
                    port: 443,
                    path: '/bot' + app.get('telegrambot_token') + '/sendMessage',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData),
                        'Accept': 'application/json'
                    }
                }

                const https_req = https.request(options, (res) => {
                    console.log(res)
                    console.log(`STATUS: ${res.statusCode}`)
                    console.log(`HEADERS: ${JSON.stringify(res.headers)}`)
                    res.setEncoding('utf8')
                    res.on('data', (chunk) => {
                        console.log(`BODY: ${chunk}`)
                    })
                    res.on('end', () => {
                    })
                })

                https_req.on('error', (e) => {
                    console.error(`problem with request: ${e.message}`)
                })

                https_req.write(postData)
                https_req.end()

                return res.json('Accesso effettuato')
            })

        })
})

module.exports = router