express = require 'express'
router  = express.Router()
List    = require '../models/list'
User    = require '../models/user'
moment  = require 'moment'
uuid    = require 'node-uuid'

isLoggedIn = (req, res, next) ->
  if req.isAuthenticated()
    return next()
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

router.post '/deactivate', (req, res)->
  res.send 'ok'
  return

router.post '/views/create', isLoggedIn, (req, res)->
  res.render 'matchs/create.ejs'
  return

router.post '/views/list', isLoggedIn, (req, res)->
    List.find {}, (err, list) ->
        console.log list
        if err
            res.send err
            return
        res.render 'matchs/list.ejs', message: req.flash('loginMessage'), lists: list, user: req.user, moment: moment
        return

router.post '/participate', isLoggedIn, (req, res)->
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

router.get '/match/:listid', isLoggedIn,(req, res) ->

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

router.get '/match/details/:listid', isLoggedIn, (req, res) ->
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

router.post '/match/create', isLoggedIn, (req, res, next) ->
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

router.post '/match/edit/status', isLoggedIn, (req, res, next) ->
    
    list_id     = req.body.list_id
    list_status = req.body.list_status

    List.update { _id : list_id }, { 'list_status' : String(list_status) },(err, numAffected) ->
        if err
            return { message: err }
        else
            if numAffected > 0
                res.send { message: 'ok' }
            else
                res.send { message: '0 rows affected' }
            return

module.exports = router;