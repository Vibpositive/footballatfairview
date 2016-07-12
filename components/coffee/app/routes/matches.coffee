List    = require '../models/list'
User    = require '../models/user'
moment  = require 'moment'
uuid    = require 'node-uuid'
_       = require "underscore"
ObjectId = require('mongodb').ObjectID;

isLoggedIn = (req, res, next) ->
    if req.isAuthenticated()
        return next()
    res.redirect '/'
    return

addMatchToUserList = (user, match, operation, next) ->
    if operation == 'push'

        User.update { _id : user.id }, { $addToSet : { 'matches' : match } },(err, numAffected) ->
            if err
                return { message: err }
            else
                if numAffected > 0
                    return { message: 'ok' }
                else
                    return { message: '0 rows affected' }
                return

    else
        User.findByIdAndUpdate { _id : user.id }, { $pull: 'matches' : match }, (err, numAffected) ->
          if err
            return { message : err }
          else
            return { message : numAffected }

module.exports = (app) ->

    app.get '/matches', isLoggedIn, (req, res) ->
        List.find {}, (err, list) ->
            if err
                return console.log err
            res.render 'matches/index.ejs',
            message: req.flash('loginMessage')
            lists: list
            user: req.user
            moment: moment
            title: 'Matches List'
            return
        return

    app.post '/matches/views/playerslist', isLoggedIn, (req, res)->
        List.findOne {_id : req.body.list_id }, (err, list) ->
            if err
                res.send err
                return
            res.render 'matches/names/names_list.ejs',
            message : req.flash('loginMessage')
            list    : list
            user    : req.user
            moment  : moment
            title   : "Matches index"
            return

    app.post '/matches/addusertomatch', (req, res)->

        list_id    = req.body.list_id
        
        User.find {}, (err, result)->
            _.each result, (item)->
                List.update { '_id' : list_id }, { $addToSet : { 'names' : {
                    player_id  : item._id
                    datetime   : ""
                    last_name  : item.facebook.last_name
                    first_name : item.facebook.first_name
                    full_name  : item.facebook.full_name
                    phone      : item.phone
                    status     : 'playing'
                    } } },(err, numAffected) ->
                      return
                return

            res.send "ok"

    app.post '/matches/participate', isLoggedIn, (req, res)->

        player_id  = new ObjectId(req.user.id)
        datetime   = 'date'
        last_name  = req.user.facebook.last_name
        first_name = req.user.facebook.first_name
        full_name  = req.user.facebook.first_name + " " + req.user.facebook.last_name
        list_id    = req.body.list_id
        phone      = req.user.phone

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
            status     : 'playing'
            phone      : phone
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
          List.findOne { '_id' : list_id }, (err, list)->

            currentTime = moment()
            matchTime   = moment(list.list_date, "x")

            diffMinutes = currentTime.diff(matchTime, 'minutes')

            if diffMinutes > -360
                # TODO: Create penalty
                # TODO: Insert penalty to user list
                console.log diffMinutes
            
            addMatchToUserList(req.user, list_id, 'pull')

            List.findByIdAndUpdate { '_id' : list_id }, { $pull: 'names': full_name : full_name }, (err, model) ->
              if err
                res.send 'err: ' + String(err)
              else
                res.send model
            return


    app.get '/matches/match/:listid', isLoggedIn,(req, res) ->

            listid = req.params.listid

            List.find { '_id': listid, 'names': $elemMatch: 'full_name': req.user.facebook.full_name }, (err, sec_res) ->

                player_on_list = if sec_res.length <= 0 then false else true

                List.findOne { _id: listid }, (err, list) ->
                    if err
                        console.log err
                        return
                    # return
                    res.render     'matches/match_details.ejs',
                    message        : req.flash('loginMessage')
                    list           : list
                    match_date     : moment(list.date).format("dddd, MMMM Do YYYY, h : mm : ss a");
                    user           : req.user
                    player_on_list : player_on_list
                    moment         : moment
                    disabled       : if list.list_status == 'deactivate' then 'disabled' else ''
                    title          : "Match"
                    return
            return

    app.get '/matches/match/details/:listid', isLoggedIn, (req, res) ->
        List.findOne { _id: req.params.listid }, (err, list) ->
            if err
                console.log err
                return
            # return
            res.render 'matches/match_list_details.ejs',
            message    : req.flash('loginMessage')
            list       : list
            match_date : moment(list.date).format("dddd, MMMM Do YYYY, h : mm : ss a");
            user       : req.user
            title      : "Match: details"
            return
        return

    app.get '/matches/create', isLoggedIn, (req, res)->
      res.render 'matches/create.ejs', title: 'Create a match'
      return

    app.get '/matches/edit', isLoggedIn, (req, res)->
        List.find {}, (err, list) ->
            if err
                res.send err
                return
            res.render 'matches/list.ejs',
            message : req.flash('loginMessage')
            lists   : list
            user    : req.user
            moment  : moment
            title   : "Matches index"
            return

    app.get '/matches/edit/:listid', isLoggedIn, (req, res, next) ->
        
        listid     = req.params.listid

        List.findOne { _id : listid }, {},(err, listFound) ->
            if err
                return { message: err }
            else
                res.render 'matches/edit.ejs',
                message: ''
                list: listFound
                user: req.user
                moment: moment
                title: 'Matches List'
                return

    # TODO: Improve route trying using just one
    # app.post '/matches/edit/match', isLoggedIn, (req, res, next) ->
    app.post '/matches/edit/match', (req, res, next) ->
        
        list_id       = req.body.list_id
        player_status = req.body.player_status
        full_name     = req.body.full_name
        player_id     = new ObjectId(req.body.player_id)

        if player_status == "remove"

            List.findByIdAndUpdate { '_id' : list_id }, { $pull: names : full_name : full_name, player_id : new ObjectId(player_id) }, (err, model) ->
                if err
                    return res.status(422).json(err)
                List.findOne {_id : list_id, 'names.full_name' : full_name}, (err2, model2)->

                    if err
                        return res.status(422).json(err2)
                    res.status(200).json(model2);

            return
        return

     app.post '/matches/create', isLoggedIn, (req, res, next) ->
        isParticipating = req.body.names

        if isParticipating == 'true'
            names = [{
                player_id  : new ObjectId(req.user.id)
                datetime   : 'date'
                last_name  : req.user.facebook.last_name
                first_name : req.user.facebook.first_name
                full_name  : req.user.facebook.first_name + " " + req.user.facebook.last_name
                phone      : req.user.phone
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
        match.save (err, result, numAffected)->
            util = require('util')
            if err
                console.log err
                if typeof(err) == 'object'
                    res.json( { message : 'Object already exists' } )
                else
                    res.json( { message : err } )
                return
            else
                if numAffected > 0
                    res.json({ message: 'ok' });
                else
                    res.json({ message: String(numAffected) + ' rows affected' });
                    return
        

    app.post '/matches/update', isLoggedIn, (req, res, next) ->

        list_id     = req.body.list_id
        list_date   = req.body.list_date
        list_status = req.body.list_status
        list_size   = req.body.list_size

        if list_id == '' || list_status == '' || list_date == '' || list_size < 0
            res.json {'message' : 'wrong params'}
            return

        List.update {
            '_id' : list_id
        },{
            '$set' : {
                'list_size'   : list_size
                'list_status' : list_status
                'list_date'   : list_date
            }
        },(err, numAffected) ->
            if err
                res.json({message: err})
            else
                if numAffected > 0
                    res.json({ message: 'ok' });
                else
                    res.json({ message: String(numAffected) + ' rows affected' });
                    return
    return