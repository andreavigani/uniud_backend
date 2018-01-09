var mongoose = require('mongoose')
var Schema = mongoose.Schema

var TeacherSchema = new Schema({
  _id: String,
  id_number: { type: String, get: function(){ return this._id; }, set: function (id) { this._id = id; return this._id; } },
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  phone: String,
  email: String
})

module.exports = mongoose.model('Teacher', TeacherSchema)