var express = require('express')
var router = express.Router()
var crypto = require('crypto')

var Student = require('../models/student')

router.post('/', function (req, res) {

    req.body.salt = crypto.randomBytes(64).toString('base64')

    var password_hash = crypto.createHash('sha256').update(req.body.password + req.body.salt).digest('base64')

    req.body.password_hash = password_hash

    var student = new Student(req.body)

    student.save(function (err) {
        if (err)
            return res.send(err)

        res.json({ message: 'Studente aggiunto!' })
    })

})

router.get('/', function (req, res) {
    Student.find(function (err, students) {
        if (err)
            res.send(err)

        res.json(students)
    })
})

router.get('./:student_id', function (req, res) {

    Student.findOne({ 'id_number': req.params.student_id }).populate('course_id', 'course_name').
        exec(function (err, student) {
            if (err)
                return res.send(err)

            res.json(student)
        })
})

router.put('./:student_id', function (req, res) {

    Student.findById(req.params.student_id, function (err, student) {

        if (err)
            return res.send(err)

        student.id_number = req.body.id_number
        student.name = req.body.name
        student.lastname = req.body.lastname
        student.course_id = req.body.course_id

        student.save(function (err) {
            if (err)
                res.send(err)

            res.json({ message: 'Studente aggiornato!' })
        })

    })
})

router.delete('./:student_id', function (req, res) {
    Student.remove({
        _id: req.params.student_id
    }, function (err, student) {
        if (err)
            res.send(err)

        res.json({ message: 'Studente eliminato!' })
    })
})

module.exports = router