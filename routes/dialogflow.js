var express = require('express')
var router = express.Router()
var crypto = require('crypto')

var GoogleSearch = require('google-search');
var googleSearch = new GoogleSearch({
  key: 'AIzaSyCP-bw1CNbqT8f0IcprSpGzpt7iiWapP5g',
  cx: '005939994384966855335:2ruwalevm8y'
});


var Student = require('../models/student')
var Session = require('../models/session')

var message = require('../utils/dialogflow_responses/message')
var buttons_list = require('../utils/dialogflow_responses/buttons-list')
var card = require('../utils/dialogflow_responses/card')
var inline_keyboard = require('../utils/dialogflow_responses/inline-keyboard')
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

  Session.findOne({
    'user_id': user_id
  }).
  exec(function (err, session) {
    if (err) {
      return res.send(err)
    }
    if (!session || !session.id_number) {

      var secret = crypto.randomBytes(16).toString('base64').replace(/\//g, '0').replace(/=/g, '')
      if (!session) {
        session = new Session({
          user_id: user_id
        })
      }
      session.validation_secret = secret
      session.save()

      var login_url = encodeURI('https://' + req.headers.host + '/login/' + secret)

      return res.json(message('Vai al seguente link per effettuare il login ed accedere a tutte le funzionalità:\n' + login_url))
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
      e => e.grade && e.confirmation_date ? e.exam_id.name + ' | ' + e.grade + '/30 ' + '\u2705' :
      (e.grade ? e.exam_id.name + ' | ' + e.grade + '/30 ' + '\u231B' : e.exam_id.name),
      e => e.grade && e.confirmation_date ? 'Dettagli ' + e._id :
      (!e.grade ? 'Appelli ' + e.exam_id.name : 'Azione esito ' + e._id)
    )
    res.json(response)
  })
})

//EXAM GRADE DETAILS
router.post('/exam_grades_details', function (req, res) {
  var examgrade_id = req.body.result.parameters.examgrade_id
  Student.findById(req.id_number).exec(function (err, student) {
    if (err)
      return res.send(err)
    var exam_grade = student.exam_grades.filter(eg => eg._id == examgrade_id)
    var response = message('Valutazione già registrata: ' + exam_grade[0].grade + '/30')
    res.json(response)
  })
})

//EXAM GRADES RESULTS
router.post('/exams_results', function (req, res) {
  Student.findById(req.id_number).populate('exam_grades.exam_id').exec(function (err, student) {
    if (err)
      return res.send(err)

    student.exam_grades = student.exam_grades.filter(eg => eg.grade && eg.status == "In attesa")
    if (student.exam_grades.length == 0) {
      var response = message('Nessun esito disponibile.')
    } else {
      var response = buttons_list('<b>Bacheca esiti</b> (tocca per accettare o rifiutare):',
        student.exam_grades,
        e => e.exam_id.name + ' | ' + e.grade + '/30 ' + '\u231B',
        e => 'Azione esito ' + e._id)
    }
    res.json(response)
  })
})
//ACTION GRADES RESULTS
router.post('/action_exam_result', function (req, res) {
  var examgrade_id = req.body.result.parameters.examgrade_id
  var actions = [{
      "text": "Accetto",
      "callback": "Accetto " + examgrade_id
    },
    {
      "text": "In attesa",
      "callback": "In attesa " + examgrade_id
    },
    {
      "text": "Rifiuto",
      "callback": "Rifiuto " + examgrade_id
    }
  ]
  var response = inline_keyboard('Seleziona una scelta:', actions)
  res.json(response)

})

//UPDATE GRADES RESULTS
router.post('/update_exam_result', function (req, res) {
  var choice = req.body.result.parameters.choice
  var examgrade_id = req.body.result.parameters.examgrade_id

  Student.findById(req.id_number).exec(function (err, student) {
    if (err)
      return res.send(err)
    student.exam_grades = student.exam_grades.map(function (eg) {
      if (eg._id == examgrade_id) {
        eg.status = choice
        if (choice == "Accetto")
          eg.confirmation_date = new Date;
        if (choice == "Rifiuto") {
          eg.status = "In attesa"
          eg.grade = null;
        }
      }

      return eg
    })
    student.save()

    var response = message('Esito esame aggiornato!')
    res.json(response)
  })
})

//EXAM SESSIONS
var Exam = require('../models/exam')
var ExamSession = require('../models/exam_session')

router.post('/exam_sessions', (req, res) => {

  var exam_name = req.body.result.parameters.exam_name

  if (!exam_name) {

    Student.findById(req.id_number).exec()
      .catch(err => res.send(err))
      .then(student => {

        var student_exams = student.exam_grades.filter(eg => !eg.grade)
        student_exams = student_exams.map(seg => seg.exam_id)

        ExamSession.find({
          'session_date': {
            $gte: new Date()
          },
          'exam_id': {
            $in: student_exams
          }
        }).populate('exam_id').exec(function (err, exam_sessions) {

          if (exam_sessions.length == 0) {
            var response = message("Nessun appello disponibile per i tuoi corsi.")
            return res.json(response)
          }

          var response = buttons_list('Per quale corso?\nEcco i tuoi corsi con appelli disponibili:',
            exam_sessions,
            e => e.exam_id.name,
            e => 'Appelli ' + e.exam_id.name)
          return res.json(response)
        })
      })

  } else {

    Exam.findOne({
        'name': new RegExp(exam_name, "i")
      }).exec()
      .then(exam => {
        if (!exam) {
          return Student.findById(req.id_number).populate('exam_grades.exam_id').exec()
            .then(student => {
              var student_exams = student.exam_grades.filter(eg => !eg.grade)
              student_exams = student_exams.map(seg => seg.exam_id)

              ExamSession.find({
                'session_date': {
                  $gte: new Date()
                },
                'exam_id': {
                  $in: student_exams
                }
              }).populate('exam_id').exec(function (err, exam_sessions) {

                if (exam_sessions.length == 0) {
                  var response = message("Nessun appello disponibile per i tuoi corsi.")
                  return res.json(response)
                }
                var response = buttons_list('Corso non trovato.\nProva a scegliere uno di questi:',
                  exam_sessions,
                  e => e.exam_id.name,
                  e => 'Appelli ' + e.exam_id.name)
                res.json(response)
              })
            })
        } else {
          return ExamSession.find({
              'exam_id': exam._id
            }).exec()
            .then(exam_sessions => {
              var today = new Date()
              exam_sessions = exam_sessions.filter(dt => dt.session_date - today > 0)

              if (exam_sessions.length == 0) {
                var response = message("Nessun appello disponibile per " + exam.name + ".")
              } else {
                var response = buttons_list('Appelli disponibili per <b>' + exam.name + '</b> (tocca per iscriverti):',
                  exam_sessions,
                  es => es.name + ' | ' + es.session_date.toFormattedDateTime(),
                  es => 'Iscrivimi ' + es._id)
              }
              res.json(response)
            })

        }
      })
      .catch(err => res.send(err))
  }
})

//EXAM SESSION ENROLLMENTS
var ExamSessionEnrollment = require('../models/exam_session_enrollment')

//Get Exam Session Enrollments
router.post('/exam_session_enrollments', function (req, res) {
  ExamSessionEnrollment.find({
      'student_id_number': req.id_number
    })
    .populate({
      path: 'exam_session_id',
      populate: {
        path: 'exam_id'
      }
    })
    .exec((err, exam_session_enrollments) => {

      var today = new Date()
      exam_session_enrollments = exam_session_enrollments.filter(dt =>
        dt.exam_session_id.session_date - today > 0
      )
      var response = buttons_list('<b>Lista prenotazioni:</b> (tocca per cancellare)',
        exam_session_enrollments,
        ese => ese.exam_session_id.exam_id.name + ' | ' + ese.exam_session_id.session_date.toFormattedDateTime(),
        ese => 'Cancella prenotazione ' + ese._id)
      if (exam_session_enrollments.length < 1) var response = message("Non sei iscritto a nessun /appello.")
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

  ExamSessionEnrollment.find({
      'student_id_number': req.id_number
    })
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
        exam_session_enrollment.save(function (cerr) {
          if (err)
            return res.send(err)
        })
        var response = buttons_list("Iscrizione all'appello effettuata.",
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
    res.json(message("Cancellazione prenotazione avvenuta con successo."))
  })
})

//TIMES
var ExamTime = require('../models/exam_time')
router.post('/exam_times', function (req, res) {

  var days_it = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
  var day = days_it[new Date(req.body.result.parameters.date).getDay()]

  var exam_name = req.body.result.parameters.exam_name
  Student.findById(req.id_number).exec(function (err, student) {
    var student_exams = student.exam_grades.map(seg => seg.exam_id)
    ExamTime.find({
      'exam_id': {
        $in: student_exams
      }
    }).populate('exam_id', 'name').populate('classroom_id', 'name').exec(function (err, examtimes) {
      if (exam_name) {
        examtimes = examtimes.filter(function (et) {
          var reg_exp = new RegExp(exam_name, "gi");
          if (reg_exp.test(et.exam_id.name)) exam_name = et.exam_id.name
          return et.exam_id.name == exam_name
        });
      }

      if (day) {
        examtimes.times = examtimes.map(examtime =>
          examtime.times = examtime.times.filter(function (etd) {
            return etd.day_of_week == day
          })
        )
      }
      console.log(JSON.stringify(examtimes))
      var response = examtimes.map(examtime => examtime.times !== undefined && examtime.times.length ?
        "\u231A Orari lezioni di " + examtime.exam_id.name + "\n" +
        examtime.times.map(time => time.day_of_week + " " + time.start_time.getHours() + ":" + time.start_time.getMinutes() + " - " + time.end_time.getHours() + ":" + time.end_time.getMinutes()).join('\n') + '\n' +
        "Aula " + examtime.classroom_id.name + "\n" : ''
      ).join('\n')
      if (response.length < 2) response = "Nessuna orario di lezione trovato."
      res.json(message(response))

    })
  })
})

//TEACHERS
var Teacher = require('../models/teacher')
router.post('/teacher_contacts', function (req, res) {
  lastname = req.body.result.parameters.lastname;
  Teacher.findOne({
    'lastname': new RegExp(lastname, "i")
  }).
  exec(function (err, teacher) {
    if (err)
      return res.send(err)
    if (!teacher)
      res.json(message("Docente non trovato."))
    else {
      var response = message(
        "Contatti di " + teacher.name + " " + teacher.lastname + ":\n" +
        "\u2709 " + teacher.email + "\n" +
        "\u260E " + teacher.phone
      )
      res.json(response)
    }
  })
})

//FEES
var Fee = require('../models/fee')
router.post('/fees', function (req, res) {
  Fee.find({
    'student_id_number': req.id_number
  }).exec(function (err, fees) {
    if (err)
      return res.send(err)

    if (fees.length == 0) {
      var response = message('Nessuna tassa disponibile.')
    } else {
      var icon
      var response = buttons_list('<b>Elenco tasse</b> (tocca per pagare con pagoPA):',
        fees,
        f => f.status ? f.description + " | €" + f.amount + " | " + f.expiration_date.toFormattedDate() + ' \u2705' : f.description + " | €" + f.amount + " | " + f.expiration_date.toFormattedDate() + ' \u2b55',
        f => f.status ? 'Fattura' + f._id : 'Paga ' + f._id)
    }
    res.json(response)
  })
})

//WEB SEARCH
router.post('/web_search', function (req, res) {
  if (req.body.result.parameters.keywords) {
    keywords = req.body.result.parameters.keywords
    var msg = ""
  } else {
    keywords = req.body.result.resolvedQuery
    var msg = "Mi dispiace, non sono in grado di risponderti. \n"
  }


  var search_result
  googleSearch.build({
    q: keywords,
    start: 5,
    gl: "it",
    lr: "lang_it",
    num: 1,
    siteSearch: "https://www.uniud.it/"
  }, function (error, response) {
    if (error) return res.send(error)
    if (response.items) {
      response.items.map(sr => {
        search_result = {
          "title": sr.title,
          "snippet": sr.snippet,
          "link": sr.link
        }
      })
      var response = card(
        msg +
        "Cercando online ho trovato qualcosa che potrebbe aiutarti: \n", search_result)
    } else {
      var answers = [
        "Mi dispiace, purtroppo non sono in grado di risponderti.",
        "Penso di non aver capito, potresti ripetere?",
        "Scusami, non so proprio come risponderti.",
        "Mi dispiace ma non sono stato creato per questo.\nDigita / per accedere alla lista dei comandi principali."
      ]
      var i = Math.floor(Math.random() * (3 - 0 + 1) + 0);
      console.log(i)
      var answer = answers[i]
      console.log(answer)
      var response = message(answer)
    }

    res.json(response)
  });

})



//FALLBACK
router.use(function (req, res, next) {
  if (req.body.result.action == "login")
    return res.json(message("Hai già effettuato l'accesso."))
  return res.json(message("Webhook non trovato"))
})

module.exports = router