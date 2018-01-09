var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ExamSchema = new Schema({
  name: { type: String, required: true },
  teachers: [{ type: String, ref: 'Teacher.id_number' }],
  credits: { type: Number, required: true },
  ssd: { type: String, required: true },
  duration_in_hours: { type: Number, required: true },
  midterm: { type: Number, required: true },
  academic_year: { type: String, required: true }
})

module.exports = mongoose.model('Exam', ExamSchema)