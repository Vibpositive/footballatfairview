# app/routes.js
List         = require '../app/models/list'
User         = require '../app/models/user'
moment       = require 'moment'
_            = require 'underscore'

process.env.NODE_ENV = 'development'
nonSecurePaths = ['/', '/profile', '/auth/facebook', '/auth/facebook/callback', '/profile/edit/phoneNumber', '/profile/crud/details', '/cp/matches']

isLoggedIn = (req, res, next) ->
  if req.isAuthenticated()
    return next()
  res.redirect '/'
  return

module.exports = (app, passport) ->


    app.use (req, res, next) ->

        try
            if req.user != undefined
                req.user['role'] = 'guest'
        catch e
            console.log e

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

    app.get '/', (req, res) ->
        req.session.userId = 'Vibpositive'
        res.render 'login.ejs',
        message : req.flash('loginMessage')
        title   : "Login page"
        return

    app.get '/index', isLoggedIn, (req, res) ->
        List.find {}, (err, list) ->
            if err
                return console.log err
            res.render 'index.ejs',
            message: req.flash('loginMessage')
            lists: list
            user: req.user
            moment: moment
            title: 'List'
            return
        return
        
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

    return