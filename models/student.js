var mongoose = require('mongoose')
var Schema = mongoose.Schema
var crypto = require('crypto')

var StudentSchema = new Schema({
  id_number: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  course_id: { type: Schema.Types.ObjectId, ref: 'Course' },
  salt: String,
  password_hash: String
})

module.exports = mongoose.model('Student', StudentSchema)