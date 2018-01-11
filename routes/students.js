var express = require('express')
var router = express.Router()
var crypto = require('crypto')

var Student = require('../models/student')

//Middleware that generates salt and calculates password hash
router.post('/', function (req, res, next) {
    if (!req.body.password)
        return res.status(422).json({ message: 'Missing password' })
    req.body.salt = crypto.randomBytes(64).toString('base64')
    var password_hash = crypto.createHash('sha256').update(req.body.password + req.body.salt).digest('base64')
    delete req.body.password
    req.body.password_hash = password_hash

    //Fill ExamGrades
    var study_plan = require('../models/study_plan')
    study_plan.findById(req.body.study_plan, function (err, studyplan) {
        req.body.exam_grades = studyplan.exams.map(exam => {
            var exam_grade = {
                exam_id: exam,
                grade: null,
                confirmation_date: null
            }
            return exam_grade
        })

        next()
    })
});

router.put('/:id_number/exam_grade/:exam_id', function (req, res) {
    Student.findById(req.params.id_number, function (err, student) {
        if (err)
            return res.send(err)
        if (!student)
            return res.status(404).json({ message: 'student not found' })

        var exam_grade = student.exam_grades.find(grade => grade.exam_id == req.params.exam_id)
        if (!exam_grade) {
            exam_grade = {
                exam_id: req.params.exam_id
            }
        }

        Object.keys(req.body).forEach(attribute => {
            if (attribute !== "exam_id") {
                exam_grade[attribute] = req.body[attribute]
            }
        })

        student.exam_grades.push(exam_grade)
    
        console.log(student.exam_grades)
        student.save(function (err) {
            if (err)
                return res.send(err)
            res.json({ message: 'grade updated!' })
        })

    })
});

router.put('/:id_number', function (req, res) {

    Student.findById(req.params.id_number, function (err, student) {
        if (err)
            return res.send(err)
        if (!student)
            return res.status(404).json({ message: 'student not found' })
        var regenerate_exam_grades = student.study_plan !== req.body.study_plan
        Object.keys(req.body).forEach(attribute => {
            if (attribute !== "_id") {
                student[attribute] = req.body[attribute]
            }
        })

        var study_plan = require('../models/study_plan')

        study_plan.findById(req.body.study_plan, function (err, studyplan) {
            //Regen ExamGrades
            if (regenerate_exam_grades) {
                student.exam_grades = studyplan.exams.map(exam => {
                    return {
                        exam_id: exam,
                        grade: null,
                        confirmation_date: null
                    }
                })
            }

            student.save(function (err) {
                if (err)
                    return res.send(err)
                res.json({ message: 'student updated!' })
            })
        })
    })
});

//Infer other non-specified routes
router.use('/', require('./generic_router')('student', { path: 'study_plan', select: ['name'] }))

module.exports = router