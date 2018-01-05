var express = require('express')
var router = express.Router()
var crypto = require('crypto')

var Course = require('../models/course')

router.route('/courses')

    .post(function (req, res) {

        var course = new Course({
            department: req.body.department,
            course_type: req.body.course_type,
            course_class: req.body.course_class,
            course_name: req.body.course_name,
            year: req.body.year,
            city: req.body.city
        })

        course.save(function (err) {
            if (err)
                return res.send(err)

            res.json({ message: 'Corso aggiunto!' })
        })

    })

    .get(function (req, res) {
        Course.find(function (err, courses) {
            if (err)
                res.send(err)

            res.json(courses)
        })
    })


router.route('/courses/:course_id')

    .get(function (req, res) {
        Course.findById(req.params.course_id, function (err, course) {
            if (err)
                res.send(err)
            res.json(course)
        })
    })

    .put(function (req, res) {

        Course.findById(req.params.course_id, function (err, course) {

            if (err)
                res.send(err)

            course.department = req.body.department,
                course.course_type = req.body.course_type,
                course.course_class = req.body.course_class,
                course.course_name = req.body.course_name,
                course.year = req.body.year,
                course.city = req.body.city

            course.save(function (err) {
                if (err)
                    res.send(err)

                res.json({ message: 'Corso aggiornato!' })
            })

        })
    })

    .delete(function (req, res) {
        Course.remove({
            _id: req.params.course_id
        }, function (err, course) {
            if (err)
                res.send(err)

            res.json({ message: 'Corso eliminato!' })
        })
    })

module.exports = router
