var mongoose = require('mongoose')
var Schema = mongoose.Schema

var NoticeSchema = new Schema({
  date: { type: Date, default: Date.now },
  title: { type: String, required: true },
  content: String,
  category: String,
  sender: String,
  recipient_id_number: [{ type: String, ref: 'Student' }],
  broadcast: Boolean
})

module.exports = mongoose.model('Notice', NoticeSchema)