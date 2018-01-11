var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ExamSessionEnrollmentSchema = new Schema({
  exam_session_id: { type: Schema.Types.ObjectId, ref: 'ExamSession' },
  student_id_number: { type: String, ref: 'Student' },
  enrollment_date: { type: Date, default: Date.now }
})

module.exports = mongoose.model('ExamSessionEnrollment', ExamSessionEnrollmentSchema)