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
                return handleError(err)
            # render the page and pass in any flash data if it exists
            console.log list
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
        List.findOne { id: req.param.listid }, (err, list) ->
            if err
                return handleError(err)
            console.log list
            res.render 'lists/list.ejs',
            message: req.flash('loginMessage')
            list: list
            user: req.user
            return
        return
    # app.get '/crud/list/create', isLoggedIn, (req, res) ->
    app.get '/crud/list/create', (req, res) ->
        match = new List(
                list_date   : "",
                list_size   : "",
                names       : "",
                list_status : "",
                date        : ""
            )
        match.save (err)->
            if err
                res.send 'notok'
                return handleError (err)
            res.send match._i
d            return

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