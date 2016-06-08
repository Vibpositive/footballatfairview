'use strict'
express      = require('express')
app          = express()
port         = process.env.PORT or 8080
mongoose     = require('mongoose')
passport     = require('passport')
flash        = require('connect-flash')
morgan       = require('morgan')
cookieParser = require('cookie-parser')
bodyParser   = require('body-parser')
session      = require('express-session')
configDB     = require('../../config/database.js')
gabriel      = require('express-session')

mongoose.connect configDB.url

require('../../config/passport') passport

app.use morgan('dev')
app.use cookieParser()
app.use bodyParser()
app.use('/public', express.static('public'))
app.set 'view engine', 'ejs'
app.use session(secret: 'ilovescotchscotchyscotchscotch')
app.use passport.initialize()
app.use passport.session()
app.use flash()
require('../../app/routes.js') app, passport
app.listen port
console.log 'The magic happens on port ' + port