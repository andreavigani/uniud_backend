var mongoose = require('mongoose')
var Schema = mongoose.Schema

var FeeSchema = new Schema({
    invoice: { type: Number, unique: true, required: true },
    mav_number: Number,
    student_id_number: { type: String, ref: 'Student' },
    expiration_date: Date,
    description: String,
    amount: Number,
    status: Boolean,
    payment_date: Date
})

FeeSchema.path('amount').get(function (num) {
    return (num / 100).toFixed(2);
});
FeeSchema.path('amount').set(function (num) {
    return num * 100;
});

module.exports = mongoose.model('Fee', FeeSchema)