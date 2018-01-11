var express = require('express')
var router = express.Router()
var crypto = require('crypto')

var Student = require('../models/student')
var Session = require('../models/session')

var buttons_list = require('../utils/dialogflow_responses/buttons-list')
var message = require('../utils/dialogflow_responses/message')

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

        return res.json(message('Effettua il login per accedere a tutte le funzionalità:\n' + login_url))
      }

      req.id_number = session.id_number

      req.url = req.url + req.body.result.action
      router.handle(req, res)
    })
})

//Students
router.post('/students', function (req, res) {

  Student.find(function (err, students) {
    if (err)
      res.send(err)

    var response = buttons_list('Ecco la lista degli studenti',
      students,
      s => s.name + ' ' + s.lastname,
      s => "voti" + s.id_number)

    res.json(response)
  })
})

//ExamsGrades
router.post('/exams', function (req, res) {
  //Find exam where _id is in study_plans.exams of student.req.id_number
  Student.findById(req.id_number).populate('exam_grades.exam_id').exec(function (err, student) {
    console.log(student.exam_grades);
    if (err)
      res.send(err)

    var response = buttons_list('Ecco la lista degli esami',
      student.exam_grades,
      e => e.exam_id.name + 'Voto:' + e.grade,
      s => "appelli " + e._id)

    res.json(response)
  })
})


router.use(function (req, res, next) {
  return res.json(message("Webhook non trovato"))
})

module.exports = router