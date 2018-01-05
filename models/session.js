var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ObjectId = mongoose.Schema.Types.ObjectId

var SessionSchema = new Schema({
  id_number: Number,
  user_id: String,
  validation_secret: String
})

module.exports = mongoose.model('Session', SessionSchema)