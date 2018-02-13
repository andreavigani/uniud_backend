var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

var api = require('./routes/api')

app = express()

app.listen(3000, function () {
  console.log('Uniud app listening on port 3000!');
});

//Start mongod on default port
const spawn = require('child_process').spawn;
const pipe = spawn('mongod', ['--dbpath=' + path.join(__dirname, 'data/db')])

//Database
var mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/database', { useMongoClient: true })

//Print mongod messages to console
pipe.stdout.on('data', function (data) {
  console.log(data.toString('utf8'));
});

pipe.stderr.on('data', (data) => {
  console.log(data.toString('utf8'));
});

pipe.on('close', (code) => {
  console.log('Process exited with code: '+ code);
});

//Do this before exiting
var cleanup = function(){
  mongoose.disconnect()
  console.log('Disonnected from database')
  pipe.kill('SIGINT')
  console.log('mongod stopped')
}

// Catch CTRL+C
process.on ('SIGINT', () => {
  process.exit (0);
});

process.on('exit', cleanup);

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log('Connesso al database!')
})

//Mongo Express
var mongo_express = require('mongo-express/lib/middleware')
var mongo_express_config = require('./mongo_express_config')
app.use('/mongo_express', mongo_express(mongo_express_config))

//App
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

app.use('/segreteria/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/segreteria.html'))
})

//404
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  res.sendFile(path.join(__dirname, 'public/404.html'))
})


module.exports = app
