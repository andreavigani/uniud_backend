var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

var api = require('./routes/api')

app = express()

//Database
var mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/database', { useMongoClient: true })

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log('Connesso al database!')
})

//Mongo Express
var mongo_express = require('mongo-express/lib/middleware')
var mongo_express_config = require('./mongo_express_config')

app.use('/mongo_express', mongo_express(mongo_express_config))

//Telegram Bot

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/api', api)

app.use('/login/:validation_token', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/login.html'))
})

//404
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  res.sendFile(path.join(__dirname, 'public/404.html'))
})


module.exports = app
