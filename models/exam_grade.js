var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ExamGradeSchema = new Schema({
    student_id_number: { type: Schema.Types.ObjectId, ref: 'Student' },
    exam_id: { type: Schema.Types.ObjectId, ref: 'Exam' },
    grade: { type: Number, min: 0, max: 30 },
    status: { type: String, enum: ['Accettato', 'Rifiutato', 'In attesa'], default: 'In attesa' },
    confirmation_date: Date
})

module.exports = mongoose.model('ExamGrade', ExamGradeSchema)