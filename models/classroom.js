var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ClassroomSchema = new Schema({
    name: String,
    building: String
})

module.exports = mongoose.model('Classroom', ClassroomSchema)