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

  var user_id = -1
  /*if (!req.body.originalRequest) {
    user_id = 165155531
  } else*/
  if (!req.body.originalRequest.data.message) {
    user_id = req.body.originalRequest.data.callback_query.from.id
  } else {
    user_id = req.body.originalRequest.data.message.from.id
  }

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

        return res.json(message('Effettua il login al seguente link per accedere a tutte le funzionalità:\n' + login_url))
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
      s => 'voti ' + s.id_number)

    res.json(response)
  })
})

//ExamsGrades
router.post('/exams', function (req, res) {
  Student.findById(req.id_number).populate('exam_grades.exam_id').exec(function (err, student) {
    if (err)
      return res.send(err)
    console.log(student.exam_grades)
    var response = buttons_list('Ecco il tuo <b>libretto</b> (tocca per mostrare appelli):',
      student.exam_grades,
      e => e.grade ? e.exam_id.name + ' | ' + e.grade + '/30' : e.exam_id.name,
      e => e.grade ? 'Dettagli ' + e._id : 'Appelli ' + e.exam_id.name)
      console.log(response)
    res.json(response)
  })
})

//ExamSessions
var Exam = require('../models/exam')
var ExamSession = require('../models/exam_session')

router.post('/exam_sessions', function (req, res) {

  var exam_name = req.body.result.parameters.exam_name

  if (!exam_name) {

    Student.findById(req.id_number).populate('exam_grades.exam_id').exec(function (err, student) {
      if (err)
        return res.send(err)
      var response = buttons_list('Per quale corso?\nEcco i tuoi corsi con appelli disponibili:',
        student.exam_grades.filter(eg => !eg.grade),
        e => e.exam_id.name,
        e => 'Appelli ' + e.exam_id.name)
      return res.json(response)
    })

  } else {
    Exam.findOne({ 'name': new RegExp(exam_name, "i") }, function (err, exam) { //presenti in student.study_plan

      if (!exam) {
        Student.findById(req.id_number).populate('exam_grades.exam_id').exec(function (err, student) {
          if (err)
            return res.send(err)

          var response = buttons_list('Corso non trovato.\nProva a scegliere fra i seguenti:',
            student.exam_grades.filter(eg => !eg.grade),
            e => e.exam_id.name,
            e => 'Appelli ' + e.exam_id.name)
          return res.json(response)
        })
      } else {
        ExamSession.find({ 'exam_id': exam._id }, function (err, exam_sessions) {
          console.log(exam_sessions)
          if (err)
            res.send(err)

          if (exam_sessions.length == 0) { return res.json(message("Nessun appello disponibile per " + exam.name + ".")) }

          var response = buttons_list('Ecco gli appelli disponibili per <b>' + exam.name + '</b>:',
            //mostrare solo Date appelli futuri
            exam_sessions,
            es => es.name + ' | ' + (es.session_date).toUTCString(),
            es => 'Iscrivimi' + exam_sessions._id)
          return res.json(response)

        })
      }

    })
  }
  //if exam_name == "tutti","qualsiasi" mostra tutti gli appelli

})

router.use(function (req, res, next) {
  return res.json(message("Webhook non trovato"))
})

module.exports = router