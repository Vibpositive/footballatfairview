# app/routes.js
List = require('../app/models/list')
# route middleware to make sure a user is logged in

isLoggedIn = (req, res, next) ->
  # if user is authenticated in the session, carry on 
  if req.isAuthenticated()
     return next()
  # if they aren't redirect them to the home page
  res.redirect '/'
  return

module.exports = (app, passport) ->

    app.get '/', (req, res) ->
        res.render 'login.ejs', message: req.flash('loginMessage')
        return
    # TODO: Authentication

    app.get '/index', isLoggedIn, (req, res) ->
    # List.find({status : 'active'}, function (err, list)
        List.find {}, (err, list) ->
            if err
                return console.log err
            # render the page and pass in any flash data if it exists
            res.render 'index.ejs',
            message: req.flash('loginMessage')
            lists: list
            user: req.user
            return
        return

    app.get '/profile', isLoggedIn, (req, res) ->
        res.render 'profile.ejs', user: req.user
        return

    app.get '/list/:listid', isLoggedIn, (req, res) ->

        List.findOne { _id: req.params.listid }, (err, list) ->
            if err
                console.log err
                return
            # return
            res.render 'lists/list.ejs',
            message: req.flash('loginMessage')
            list: list
            user: req.user
            return
        return

    # app.get '/crud/list/create', isLoggedIn, (req, res) ->
    # app.get '/crud/list/create', (req, res, next) ->
    app.post '/crud/list/create', (req, res, next) ->

        names       = req.body.names
        list_date   = req.body.list_date
        list_size   = req.body.list_size
        list_status = req.body.list_status

        errMessage = ''

        match = new List(
                list_date   : list_date,
                list_size   : list_size,
                names       : names,
                list_status : list_status,
                date        : Date.now()
            )
        match.save (err)->
            if err

                for errName of err.errors
                    
                    console.log 'err', err.errors[errName].message
                    errMessage += err.errors[errName].message

                res.send errMessage
                return
            else
                console.log 'match._id',match._id
                res.send match._id
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