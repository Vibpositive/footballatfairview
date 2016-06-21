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
configDB     = require('./app/config/database.js')
gabriel      = require('express-session')
# matches      = require './app/routes/matches'
# profile      = require './app/routes/profile'
# controlpanel = require './app/routes/controlpanel'

mongoose.connect configDB.url

dbconnection = mongoose.connect configDB.url, (err) ->
	if err
		console.log 'MongoDb: Connection error: ' + err

app.use (error, req, res, next) ->
        res.status 400
        res.render 'errors/404.ejs',
            title: '404'
            error: error
        return
# Handle 500
app.use (error, req, res, next) ->
    res.status 500
    res.render 'errors/500.ejs',
        title: '500: Internal Server Error'
        error: error
    return

if process.env.NODE_ENV == 'development'
    app.use errorhandler {log: errorNotification}

mongoose.connection.on 'open', (ref) ->
	console.log 'Connected to mongo server.'
	
require('./app/config/passport') passport

notAuthenticated = 
	flashType: 'error',
	message: 'The entered credentials are incorrect',
	redirect: '/'

notAuthorized = 
	flashType: 'error',
	message: 'You have no access to this',
	redirect: '/index'

app.set 'permission',
	role: 'role',
	notAuthenticated: notAuthenticated,
	notAuthorized: notAuthorized 

app.use morgan('dev')
app.use cookieParser()
app.use bodyParser()
app.use('/public', express.static('public'))
app.set 'view engine', 'ejs'
app.use session(secret: 'ilovescotchscotchyscotchscotch')
app.use passport.initialize()
app.use passport.session()
app.use flash()
require('./app/routes.js') app, passport
require('./app/routes/matches.js') app
require('./app/routes/profile.js') app
require('./app/routes/controlpanel.js') app
# app.use '/matches'      , matches
# app.use '/profile'      , profile
# app.use '/controlpanel' , controlpanel
app.listen port
console.log 'The magic happens on port ' + port