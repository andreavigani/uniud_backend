var mongoose = require('mongoose')
var Schema = mongoose.Schema

var StudyPlanSchema = new Schema({
    name: { type: String, required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    class: { type: String, required: true },
    location: { type: String, required: true },
    exams: [{ type: Schema.Types.ObjectId, ref: 'Exam' }],
    optional_exams: [{ type: Schema.Types.ObjectId, ref: 'Exam' }]
})

module.exports = mongoose.model('StudyPlan', StudyPlanSchema)