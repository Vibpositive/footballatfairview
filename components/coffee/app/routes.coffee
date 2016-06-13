# app/routes.js
List         = require '../app/models/list'
User         = require '../app/models/user'
errorhandler = require 'errorhandler'
uuid         = require 'node-uuid'
moment       = require 'moment'
notifier     = require 'node-notifier'
_            = require 'underscore'
# route middleware to make sure a user is logged in

process.env.NODE_ENV = 'development'
nonSecurePaths = ['/', '/profile', '/auth/facebook', '/auth/facebook/callback', '/profile/crud/phoneNumber', '/profile/crud/details', '/cp/matchs']

isLoggedIn = (req, res, next) ->
  # if user is authenticated in the session, carry on
  if req.isAuthenticated()
    return next()
    # if they aren't redirect them to the home page
  res.redirect '/'
  return

addMatchToUserList = (user, match, operation, next) ->

    if operation == 'push'

        User.update { _id : user.id }, { $addToSet : { 'matchs' : match } },(err, numAffected) ->
            if err
                return { message: err }
            else
                if numAffected > 0
                    return { message: 'ok' }
                else
                    return { message: '0 rows affected' }
                return

    else
        User.findByIdAndUpdate { _id : user.id }, { $pull: 'matchs' : match }, (err, numAffected) ->
          if err
            return { message : err }
          else
            return { message : numAffected }

isProfileComplete = (req) ->
   

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

    app.get '/newindex', isLoggedIn, (req, res) ->
        res.render 'newindex.ejs'

    app.get '/', (req, res) ->
        res.render 'login.ejs', message: req.flash('loginMessage')
        return
    # TODO: Authentication

    app.get '/index', isLoggedIn, (req, res) ->

        List.find {}, (err, list) ->
            if err
                return console.log err
            res.render 'index.ejs',
            message: req.flash('loginMessage')
            lists: list
            user: req.user
            return
        return

    app.get '/profile', isLoggedIn, (req, res) ->
        res.render 'profile/profile.ejs', user: req.user
        return

    # app.post '/profile/crud', isLoggedIn, (req, res) ->
    app.post '/profile/crud/phoneNumber', (req, res) ->

        phoneNumber = req.body.phoneNumber
        userId      = req.user.id

        # User.update { id : userId }, { $set: { 'phone': phoneNumber }},(err, numAffected) ->
        # User.update { id : userId }, { 'phone': phoneNumber } ,(err, numAffected) ->
        User.update _id : userId, { 'phone': phoneNumber },(err, numAffected) ->
            if err
                return { message: err }
            else
                if numAffected > 0
                    res.send { message: 'ok' }
                else
                    res.send { message: '0 rows affected' }

    app.get '/profile/crud/details', (req, res) ->
        res.render 'profile/details.ejs',
        message    : req.flash('loginMessage')
        user       : req.user
        return
    ######
    
    app.get '/list/:listid', isLoggedIn,(req, res) ->

        listid = req.params.listid

        List.find { '_id': listid, 'names': $elemMatch: 'full_name': req.user.facebook.full_name }, (err, sec_res) ->

            player_on_list = if sec_res.length <= 0 then false else true

            List.findOne { _id: listid }, (err, list) ->
                if err
                    console.log err
                    return
                # return
                res.render     'lists/list.ejs',
                message        : req.flash('loginMessage')
                list           : list
                match_date     : moment(list.date).format("dddd, MMMM Do YYYY, h : mm : ss a");
                user           : req.user
                player_on_list : player_on_list
                return
        return

    app.get '/list/details/:listid', isLoggedIn, (req, res) ->

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

    app.post '/crud/list/create', isLoggedIn, (req, res, next) ->
        isParticipating = req.body.names

        if isParticipating == 'true'
            names = [{
                player_id  : req.user.facebook.id
                datetime   : 'date'
                last_name  : req.user.facebook.last_name
                first_name : req.user.facebook.first_name
                full_name  : req.user.facebook.first_name + " " + req.user.facebook.last_name
                status     : 'playing'
            }]
        else
            names = []

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

    app.post '/crud/list/participate', isLoggedIn ,(req, res, next) ->

        player_id  = req.user.facebook.id
        datetime   = 'date'
        last_name  = req.user.facebook.last_name
        first_name = req.user.facebook.first_name
        full_name  = req.user.facebook.first_name + " " + req.user.facebook.last_name
        status     = 'playing'
        list_id    = req.body.list_id

        if req.body.player_status == 'true'

            # TODO: Use UUID instead of DB id
            # list_id    = '57587de6d1c385f511fbbb17'

            addMatchToUserList(req.user, list_id, 'push')

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

            addMatchToUserList(req.user, list_id, 'pull')

            List.findByIdAndUpdate { '_id' : list_id }, { $pull: 'names': full_name : full_name }, (err, model) ->
              if err
                res.send 'err: ' + String(err)
              else
                res.send model

    # app.get '/cp', (req, res, next) ->
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