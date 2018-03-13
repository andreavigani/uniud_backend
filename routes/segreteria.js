var express = require('express')
var router = express.Router()
var https = require('https')
var pluralize = require('pluralize')
var config = require('../config')

var Student = require('../models/student')
var Session = require('../models/session')

var buttons_list = require('../utils/dialogflow_responses/buttons-list')
var message = require('../utils/dialogflow_responses/message')
var formatted_date_time = require('../utils/formatted-date-time');

//Send Message Config
function sendMessage(postData) {
    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: '/bot' + config.telegrambot_token + '/sendMessage',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Accept': 'application/json'
        }
    }

    const https_req = https.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`)
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`)
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`)
        })
        res.on('end', () => {})
    })

    https_req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`)
    })

    https_req.write(postData)
    https_req.end()
}

//Send Notice
var Notice = require('../models/notice')

router.post('/notice/', function (req, res) {
    console.log(req.body)
    var message =
        "\u{1F4E3} <b>" + req.body.title.toUpperCase() + "</b>\n" +
        "<i> " + req.body.category + "</i>\n" +
        "\u{1F464} <b>" + req.body.sender + "</b>\n \n" +
        req.body.content


    Session.find().exec(function (err, sessions) {

        sessions.map(uid => {
            const postData = JSON.stringify({
                'chat_id': uid.user_id,
                'text': message,
                'parse_mode': 'HTML'
            })

            sendMessage(postData);
        })

        return res.json('Comunicazione inviata')
    })
})

//Add Exam Session
router.post('/examsession/', function (req, res) {
    var message =
        "\u{1F4C5} <b>NUOVO APPELLO DISPONIBILE.</b>\n" +
        "Corso: " + req.body.exam_name + "\n" +
        "Data: " + req.body.session_date

    Session.find().exec(function (err, sessions) {

        sessions.map(uid => {
            //Send notice
            const postData = JSON.stringify({
                'chat_id': uid.user_id,
                'text': message,
                'parse_mode': 'HTML'
            })

            sendMessage(postData);
        })

        return res.json('Appello aggiunto')
    })
})

//Add Exam Grade Result
router.post('/examgraderesult/', function (req, res) {
    console.log(req.body)
    var message =
        "\u{270F} <b>NUOVO ESITO PUBBLICATO.</b>\n" +
        "Corso: " + req.body.exam_name + "\n" +
        "Voto: " + req.body.grade + "\n\n" +
        "Vai alla bacheca /esiti per accettare o rifiutare"

    Session.find({'id_number': req.body.id_number}).exec(function (err, sessions) {

        sessions.map(uid => {
            //Send notice
            const postData = JSON.stringify({
                'chat_id': uid.user_id,
                'text': message,
                'parse_mode': 'HTML'
            })

            sendMessage(postData);
        })

        return res.json('Esito aggiunto')
    })
})


module.exports = router