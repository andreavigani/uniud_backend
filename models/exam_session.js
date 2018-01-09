var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ExamSessionSchema = new Schema({
    name: String,
    exam_id: { type: Schema.Types.ObjectId, ref: 'Exam' },
    session_date: { type: Date, default: Date.now },
    publication_date: { type: Date, default: Date.now },
    expiration_date: { type: Date, default: Date.now }
})

module.exports = mongoose.model('ExamSession', ExamSessionSchema)