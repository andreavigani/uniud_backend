var express = require('express')
var router = express.Router()
var crypto = require('crypto')

var Student = require('../models/student')
var Session = require('../models/session')

//Session
router.post('/', function (req, res) {
  console.log('Requested action: ' + req.body.result.action)
  console.log(req.body)

  var user_id = req.body.originalRequest.data.message.from.id
  Session.findOne({ 'user_id': user_id }).
    exec(function (err, session) {
      if (err) {
        return res.send(err)
      }
      if (!session || !session.id_number) {

        var secret = crypto.randomBytes(16).toString('base64').replace(/\//g, '0').replace(/=/g, '')
        console.log(secret)
        if (!session) {
          session = new Session({ user_id: user_id })
        }
        session.validation_secret = secret
        session.save()

        var login_url = encodeURI('https://' + req.headers.host + '/login/' + secret)

        var message = 'Effettua il login per accedere a tutte le funzionalità:\n' + login_url
        var response = {
          "speech": message,
          "displayText": message
        }
        return res.json(response)
      }

      req.id_number = session.id_number

      req.url = req.url + req.body.result.action
      router.handle(req, res)
    })
})

router.use(function (req, res, next) {
  var response = {
    "speech": "Webhook non trovato",
    "displayText": "Webhook non trovato"
  }
  return res.json(response)
})


//Students
router.post('/students', function (req, res) {
  Student.find(function (err, students) {
    if (err)
      res.send(err)

    var response = {
      "speech": "",
      "displayText": "",

      "messages": [
        /*{
          "type": 1,
          "platform": "telegram",
          "title": "Ecco la lista degli studenti",
          "buttons": students.map(s => { return { "text": s.name + ' ' + s.lastname, "postback": "voti " + s.id_number }})
        },*/
        {
          "type": 4,
          "platform": "telegram",
          "payload": {
            "telegram": {
              "text": "Ecco la lista degli studenti",
              "reply_markup": {
                "inline_keyboard":
                  students.map(s => { return [{ "text": s.name + ' ' + s.lastname, "callback_data": "voti " + s.id_number }] })
              }
            }
          }
        },
        {
          "type": 0,
          "speech": "Lista studenti"
        }
      ],
      "contextOut": [],
      "source": "ESSE3"
    }

    res.json(response)
  })
})

module.exports = router