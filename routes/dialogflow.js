var express = require('express')
var router = express.Router()
var crypto = require('crypto')

var Student = require('../models/student')
var Session = require('../models/session')

var buttons_list = require('../utils/dialogflow_responses/buttons-list')
var message = require('../utils/dialogflow_responses/message')
var formatted_date_time = require('../utils/formatted-date-time');

//SESSION
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

//STUDENTS
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

//EXAM GRADES
router.post('/exams', function (req, res) {
  Student.findById(req.id_number).populate('exam_grades.exam_id').exec(function (err, student) {
    if (err)
      return res.send(err)
    var response = buttons_list('Ecco il tuo <b>libretto</b> (tocca per mostrare appelli):',
      student.exam_grades,
      e => e.grade ? e.exam_id.name + ' | ' + e.grade + '/30' : e.exam_id.name,
      e => e.grade ? 'Dettagli ' + e._id : 'Appelli ' + e.exam_id.name)
    res.json(response)
  })
})

//EXAM SESSIONS
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

          var response = buttons_list('Corso non trovato.\nPuoi scegliere fra i seguenti:',
            student.exam_grades.filter(eg => !eg.grade),
            e => e.exam_id.name,
            e => 'Appelli ' + e.exam_id.name)
          return res.json(response)
        })
      } else {
        ExamSession.find({ 'exam_id': exam._id }, function (err, exam_sessions) {
          if (err)
            res.send(err)

          if (exam_sessions.length == 0) { return res.json(message("Nessun appello disponibile per " + exam.name + ".")) }
          var response = buttons_list('Appelli disponibili per <b>' + exam.name + '</b>:',
            //mostrare solo Date appelli futuri
            exam_sessions,
            es => es.name + ' | ' + es.session_date.toFormattedDateTime(),
            es => 'Iscrivimi ' + es._id)
          return res.json(response)

        })
      }

    })
  }

})

//EXAM SESSION ENROLLMENTS
var ExamSessionEnrollment = require('../models/exam_session_enrollment')

//Get Exam Session Enrollments
router.post('/exam_session_enrollments', function (req, res) {
  ExamSessionEnrollment.find({ 'student_id_number': req.id_number })
    .populate({ path: 'exam_session_id', populate: { path: 'exam_id' } })
    .exec((err, exam_session_enrollments) => {
      //console.log(JSON.stringify(exam_session_enrollments, null, '\t'))
      var response = buttons_list('<b>Lista prenotazioni:</b> (tocca per cancellare)',
        exam_session_enrollments,
        ese => ese.exam_session_id.exam_id.name + ' | ' + ese.exam_session_id.session_date.toFormattedDateTime(),
        ese => 'Cancella prenotazione ' + ese._id)
      res.json(response)
    })
})

//Add Exam Session Enrollment
router.post('/add_exam_session_enrollment', function (req, res) {
  var exam_session_id = req.body.result.parameters.exam_session_id
  var exam_session_enrollment = new ExamSessionEnrollment({
    exam_session_id: req.body.result.parameters.exam_session_id,
    student_id_number: req.id_number
  })

  ExamSessionEnrollment.find({ 'student_id_number': req.id_number })
    .populate('exam_id', 'name').exec(function (err, exam_session_enrollments) {
      if (err)
        res.send(err)

      exam_session_enrollments = exam_session_enrollments.filter(function (ese) {
        return ese.exam_session_id == exam_session_id
      });

      if (exam_session_enrollments.length > 0) {
        var response = buttons_list("Sei già iscritto a questo appello!",
          exam_session_enrollment = [exam_session_enrollment],
          ese => 'Mostra bacheca prenotazioni',
          ese => 'Mostra bacheca prenotazioni')
        return res.json(response)
      } else {
        exam_session_enrollment.save(function (err) {
          if (err)
            return res.send(err)
        })
        console.log(JSON.stringify(exam_session_enrollment))
        var response = buttons_list("Prenotazione all'appello effettuata.",
          exam_session_enrollment = [exam_session_enrollment],
          ese => 'Mostra bacheca prenotazioni',
          ese => 'Mostra bacheca prenotazioni')
        return res.json(response)
      }
    })

})

//Del Exam Session Enrollment
router.post('/del_exam_session_enrollment', function (req, res) {
  ExamSessionEnrollment.remove({
    _id: req.body.result.parameters.exam_session_enrollment_id
  }, function (err, model) {
    if (err)
      return res.send(err)
    res.json(message("Cancellazione avvenuta con successo."))
  })
})


router.use(function (req, res, next) {
  return res.json(message("Webhook non trovato"))
})

module.exports = router