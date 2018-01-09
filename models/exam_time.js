var mongoose = require('mongoose')
var Schema = mongoose.Schema

var timeSchema = new Schema({ 
    day_of_week: String,
    start_time: Date,
    end_time: Date
});

var ExamTimeSchema = new Schema({
    exam_id: { type: Schema.Types.ObjectId, ref: 'Exam' },
    times: [timeSchema],
    classroom_id: { type: Schema.Types.ObjectId, ref: 'Classroom' },
    cancelled_dates: [Date]
})

module.exports = mongoose.model('ExamTime', ExamTimeSchema)