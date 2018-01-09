var mongoose = require('mongoose')
var Schema = mongoose.Schema

var CourseSchema = new Schema({
  department: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  study_plans: [{ type: Schema.Types.ObjectId, ref: 'StudyPlan' }],
  duration_in_years: { type: Number, required: true },
  credits: { type: Number, required: true },
  academic_year: { type: String, required: true }
})

module.exports = mongoose.model('Course', CourseSchema)