var mongoose = require('mongoose')
var Schema = mongoose.Schema

var CourseSchema = new Schema({
  department: String,
  course_type: String,
  course_class: String,
  course_name: String,
  year: Date,
  city: String
})

module.exports = mongoose.model('Course', CourseSchema)