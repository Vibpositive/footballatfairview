# footballatfairview/app/routes/penalties.coffee

List        = require '../models/list'
User        = require '../models/user'
Penalty     = require '../models/penalty'
UserPenalty = require '../models/user_penalty'

moment      = require 'moment'
uuid        = require 'node-uuid'
_           = require "underscore"
ObjectId    = require('mongodb').ObjectID;

isLoggedIn = (req, res, next) ->
    if req.isAuthenticated()
        return next()
    res.redirect '/'
    return

module.exports = (app) ->

    app.get '/penalties', isLoggedIn, (req, res) ->
        res.render 'penalties/index.ejs',
        message : req.flash('loginMessage')
        user    : req.user
        moment  : moment
        title   : 'Penalties'
        return

    app.get '/penalties/create', isLoggedIn, (req, res) ->
        Penalty.find {}, (p_err, p_list)->
            if p_err
                return console.log p_err

            User.find {}, (err, list) ->
                if err
                    return console.log err

                List.find {list_status : "active"}, (l_err, l_list) ->
                    if l_err
                        return console.log l_err

                    res.render 'penalties/create.ejs',
                    message   : req.flash('loginMessage')
                    users     : list
                    penalties : p_list
                    matches   : l_list
                    user      : req.user
                    moment    : moment
                    title     : 'Penalties'
                    return
                return
            return
        return

    # app.post '/penalties/create', isLoggedIn, (req, res) ->
    app.post '/penalties/create', (req, res) ->

        player_id  = req.body.player_id
        penalty_id = req.body.penalty_id
        match_id   = req.body.match_id

        console.log player_id, penalty_id, match_id

        newUserPenalty = new UserPenalty
            player_id  : player_id
            penalty_id : penalty_id
            match_id   : match_id

        newUserPenalty.save (err, result, numAffected)->
            if err
                console.log err
                return res.status(422).json {message:err}
            res.json { message : newUserPenalty._id }
            return
        return

    app.get '/penalties/edit', isLoggedIn, (req, res) ->
        List.find {}, (err, list) ->
            if err
                return console.log err
            res.render 'penalties/edit.ejs',
            message : req.flash('loginMessage')
            lists   : list
            user    : req.user
            moment  : moment
            title   : 'Penalties'
            return
        return

    app.get '/penalties/view', isLoggedIn, (req, res) ->
        List.find {}, (err, list) ->
            if err
                return console.log err
            res.render 'penalties/view.ejs',
            message : req.flash('loginMessage')
            lists   : list
            user    : req.user
            moment  : moment
            title   : 'Penalties'
            return
        return