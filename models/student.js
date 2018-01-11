var mongoose = require('mongoose')
var Schema = mongoose.Schema
var crypto = require('crypto')

var ExamGradeSchema = new Schema({
  exam_id: { type: Schema.Types.ObjectId, ref: 'Exam' },
  grade: { type: Number, min: 18, max: 30 },
  status: { type: String, enum: ['Accettato', 'Rifiutato', 'In attesa'], default: 'In attesa' },
  confirmation_date: Date
})

var StudentSchema = new Schema({
  _id: String,
  id_number: { type: String, get: function(){ return this._id; }, set: function (id) { this._id = id; return this._id; } },
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  study_plan: { type: Schema.Types.ObjectId, ref: 'StudyPlan' },
  exam_grades: [ExamGradeSchema],
  salt: String,
  password_hash: String
},{ usePushEach: true })

module.exports = mongoose.model('Student', StudentSchema)