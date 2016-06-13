# app/routes.js
List         = require '../app/models/list'
User         = require '../app/models/user'
errorhandler = require 'errorhandler'
uuid         = require 'node-uuid'
moment       = require 'moment'
notifier     = require 'node-notifier'
_            = require 'underscore'

process.env.NODE_ENV = 'development'
nonSecurePaths = ['/', '/profile', '/auth/facebook', '/auth/facebook/callback', '/profile/edit/phoneNumber', '/profile/crud/details', '/cp/matchs']

isLoggedIn = (req, res, next) ->
  if req.isAuthenticated()
    return next()
  res.redirect '/'
  return

errorNotification = (err, str, req) ->
    title = 'Error in ' + req.method + ' ' + req.url
    notifier.notify
    {
        title: title,
        message: str
    }

module.exports = (app, passport) ->

    app.use (req, res, next) ->

        if _.contains(nonSecurePaths, req.path)
            return next()

        try
            if req.user.id

                 User.findOne { _id : req.user.id }, (err, userResult) ->
                    if err
                        console.log err
                        return false

                    if userResult.phone == '000-000-0000'
                        res.redirect '/profile'
                    else
                        return next()

        catch err
            return next()

    notAuthenticated = 
        flashType: 'error',
        message: 'The entered credentials are incorrect',
        redirect: '/login'

    app.get '/newindex', isLoggedIn, (req, res) ->
        res.render 'newindex.ejs'

    app.get '/', (req, res) ->
        res.render 'login.ejs', message: req.flash('loginMessage')
        return
        
    app.get '/index', isLoggedIn, (req, res) ->
        req.user.admin = true

        List.find {}, (err, list) ->
            if err
                return console.log err
            res.render 'index.ejs',
            message: req.flash('loginMessage')
            lists: list
            user: req.user
            return
        return
    ###
    app.get '/cp', isLoggedIn, (req, res) ->
        res.render 'cp/index.ejs'
        return
        
    app.post '/cp/matchs/list', isLoggedIn, (req, res) ->
        List.find {}, (err, list) ->
            console.log list
            if err
                res.send err
                return
            res.render 'matchs/list.ejs', message: req.flash('loginMessage'), lists: list, user: req.user
            return
        return
    ###

    app.get '/logout', (req, res) ->
        req.logout()
        res.redirect '/'
        return

    app.get '/auth/facebook', passport.authenticate('facebook', scope: 'email')
    app.get '/auth/facebook/callback', passport.authenticate('facebook',successRedirect: '/index',failureRedirect: '/')

    app.get '/logout', (req, res) ->
        req.logout()
        res.redirect '/'
        return

    app.use (error, req, res, next) ->
        res.status 400
        res.render 'errors/404.ejs',
            title: '404'
            error: error
        return
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

    return