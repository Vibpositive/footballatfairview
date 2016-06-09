# app/routes.js
List = require('../app/models/list')
uuid = require 'node-uuid'
moment = require 'moment'
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

    # app.get '/list/:listid', isLoggedIn, (req, res) ->
    app.get '/list/:listid', (req, res) ->

        listid = req.params.listid

        List.find { '_id': listid, 'names': $elemMatch: 'full_name': req.user.facebook.full_name }, (err, sec_res) ->

            player_on_list = if sec_res.length <= 0 then false else true

            List.findOne { _id: listid }, (err, list) ->
                if err
                    console.log err
                    return
                # return
                res.render 'lists/list.ejs',
                message        : req.flash('loginMessage')
                list           : list
                match_date     : moment(list.date).format("dddd, MMMM Do YYYY, h : mm : ss a");
                user           : req.user
                player_on_list : player_on_list
                return
        return

    app.get '/list/details/:listid', (req, res) ->

        List.findOne { _id: req.params.listid }, (err, list) ->
            if err
                console.log err
                return
            # return
            res.render 'lists/list_details.ejs',
            message    : req.flash('loginMessage')
            list       : list
            match_date : moment(list.date).format("dddd, MMMM Do YYYY, h : mm : ss a");
            user       : req.user
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
                date        : Date.now(),
                url         : uuid.v1()
            )
        match.save (err)->
            if err

                for errName of err.errors
                    
                    errMessage += err.errors[errName].message

                res.send errMessage
                return
            else
                res.send match._id
                return

    # app.post '/crud/list/participate', isLoggedIn ,(req, res, next) ->
    app.post '/crud/list/participate', (req, res, next) ->
        player_id  = req.user.facebook.id
        datetime   = 'moment().format("dddd, MMMM Do YYYY, h : mm : ss a")'
        last_name  = req.user.facebook.last_name
        first_name = req.user.facebook.first_name
        full_name  = req.user.facebook.first_name + " " + req.user.facebook.last_name
        status     = 'playing'
        list_id    = req.body.list_id

        if req.body.player_status == 'true'

            # TODO: Use UUID instead of DB id
            # list_id    = '57587de6d1c385f511fbbb17'

            List.update { '_id' : list_id }, { $addToSet : { 'names' : {
                        player_id  : player_id
                        datetime   : datetime
                        last_name  : last_name
                        first_name : first_name
                        full_name  : full_name
                        status     : status
                    } } },(err, numAffected) ->
                if err
                    res.send 'err: ' + String(err)
                else
                    if numAffected > 0
                        res.json({ message: 'ok' });
                    else
                        res.json({ message: '0 rows affected' });
                return
        else
            # List.update { '_id' : list_id }, { $pull : 'names' : 'full_name' : full_name }, false, true , (err, numAffected) ->
            List.findByIdAndUpdate { '_id' : list_id }, { $pull: 'names': full_name : full_name }, (err, model) ->
              if err
                res.send 'err: ' + String(err)
              else
                res.send model
                ###if err
                    console.log err
                    res.send 'err: ' + String(err)
                else
                    if numAffected > 0
                        res.json({ message: 'ok' });
                    else
                        res.json({ message: '0 rows affected' });
                return###

    # app.get '/cp', isLoggedIn, (req, res) ->
    app.get '/cp', (req, res, next) ->
        res.render 'cp/index.ejs'
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