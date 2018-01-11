var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ExamGradeSchema = new Schema({
    exam_id: { type: Schema.Types.ObjectId, ref: 'Exam' },
    grade: { type: Number, min: 18, max: 30 },
    status: { type: String, enum: ['Accettato', 'Rifiutato', 'In attesa'], default: 'In attesa' },
    confirmation_date: Date
})

module.exports = mongoose.model('ExamGrade', ExamGradeSchema)