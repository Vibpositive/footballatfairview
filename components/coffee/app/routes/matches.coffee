List        = require '../models/list'
User        = require '../models/user'
moment      = require 'moment'
uuid        = require 'node-uuid'
_           = require "underscore"
Penalty     = require '../models/penalty'
UserPenalty = require '../models/user_penalty'
ObjectId    = require('mongodb').ObjectID;

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

    player_id     = new ObjectId(req.user.id)
    datetime      = 'date'
    last_name     = req.user.facebook.last_name
    first_name    = req.user.facebook.first_name
    full_name     = req.user.facebook.first_name + " " + req.user.facebook.last_name
    list_id       = req.body.list_id
    phone         = req.user.phone
    isUserBlocked = false
    updateList    = false

    if req.body.player_status == 'true'

      # TODO: Use UUID instead of DB id
      # TODO: Verifiy is user is blocked on list before adding him
      # List.findOne _id: list_id, 'names.full_name' : req.user.facebook.full_name, (err, doc)->
      List.findOne _id: list_id, 'names.player_id' : player_id, (err, doc)->
        if err
          console.log err
          return err
        if not doc
          updateList = true

        else
          _.each doc.names, (item)->
            if String(item.player_id) == String(req.user.id)
              if String(item.status) == String("blocked")
                isUserBlocked = true
                console.log "setting user as blocked"
                return
              else
                updateList = true

        if not isUserBlocked and updateList == true
          console.log "updating user"

          update = 
            $set : 
              names : 
                [player_id  : player_id
                datetime   : datetime
                last_name  : last_name
                first_name : first_name
                full_name  : full_name
                status     : 'playing'
                phone      : phone]
          ###update = 
            $addToSet : 
              names : 
                player_id  : player_id
                datetime   : datetime
                last_name  : last_name
                first_name : first_name
                full_name  : full_name
                status     : 'playing'
                phone      : phone###

          # List.findOneAndUpdate _id: list_id, update, (err, updateDoc)->
          #  TODO: Verify first if is there blocked user, and then insert, if not, insert straight aeay
          List.update '_id' : list_id , 'names': $elemMatch: 'status' : "blocked",
          {
            '$set' : {
                "names.$.datetime"       : "xxx"
                "names.$.last_name"      : "xxx"
                "names.$.first_name"     : "xxx"
                "names.$.full_name"      : "xxx"
                "names.$.phone"          : "xxx"
                "names.$.status"         : "playing"
            }
          },(err, numAffected) ->
            if err
              console.log err
              next err
              return
            # TODO: Fix the message based on validating result
            console.log "ae"
          addMatchToUserList(req.user, list_id, 'push')
    
    else
      List.findOne { '_id' : list_id }, (err, list)->
        currentTime             = moment()
        matchTime               = moment(list.list_date, "x")
        diffMinutes             = currentTime.diff(matchTime, 'minutes')
        user_index              = 9999
        is_user_on_waiting_list = false
        # is_there_waiting_list   = if list.size > 21 then true else false
        is_there_waiting_list   = true

        if diffMinutes > -360

          List.findOne '_id' : list_id , 'names': $elemMatch: 'player_id' : player_id,(err, userFound) ->          
            _.each userFound.names, (val, i)->

              if String(val.player_id) == String(req.user.id)
                user_index = i
              # END if

                if user_index > list.list_size
                  is_user_on_waiting_list = true
                # END IF
            # END _.each

            if is_there_waiting_list == false
              # TODO: Update if there is not waiting list

              # List.update '_id' : list_id , 'names': $elemMatch: 'player_id' : player_id,
              List.findByIdAndUpdate { '_id' : list_id }, { $pull: 'names' : 'player_id' : player_id }, (err, model) ->
                return
              # END IF

            else
              Penalty.findOne {description : "Player removed name from list less than 6 hours before match starting"}, (penalty_err, penalty_list)->
                if penalty_err
                  return res.status(422).json(penalty_err)

                newUserPenalty = new UserPenalty
                  player_id  : req.user.id
                  penalty_id : penalty_list.id
                  match_id   : list_id
                newUserPenalty.save (err, result, numAffected)->
                  if err
                    return res.status(422).json(err)
                    # TODO: FInish
                  # console.log newUserPenalty._id
                  User.findOne _id : req.user.id, (userError, userResult) ->
                    # console.log userResult
                    return
                  # return res.status(200).json message : numAffected
                  # TODO: Before saving penalty, verify if user status on list is blocked
                  # TODO: Insert penalty to user list

                  List.update '_id' : list_id , 'names': $elemMatch: 'player_id' : player_id,
                  {
                    '$set' : {
                      "names.$.datetime"       : ""
                      "names.$.last_name"      : ""
                      "names.$.first_name"     : ""
                      "names.$.full_name"      : ""
                      "names.$.phone"          : ""
                      "names.$.status"         : "blocked"
                      "names.$.penalty_id"     : newUserPenalty._id
                      # 'names.$.status' : 'blocked'
                    }
                  },(err, numAffected) ->

                    console.log "user_index", user_index, "list.list_size",list.list_size
                    console.log "is_user_on_waiting_list",String(is_user_on_waiting_list)

                    if err
                      res.json({message: err})
                      return

            # TODO: Update if there is waiting list


          ###List.update '_id' : list_id , 'names': $elemMatch: 'player_id' : player_id,
          {
            '$set' : {
              'names.$.status': 'blocked'
            }
          },(err, numAffected) ->

            console.log "user_index", user_index, "list.list_size",list.list_size
            console.log "is_user_on_waiting_list",String(is_user_on_waiting_list)

            if err
              res.json({message: err})
              return
            return
          Penalty.findOne {description : "Player removed name from list less than 6 hours before match starting"}, (penalty_err, penalty_list)->
            if penalty_err
              return res.status(422).json(penalty_err)

            newUserPenalty = new UserPenalty
              player_id  : req.user.id
              penalty_id : penalty_list.id
              match_id   : list_id
            newUserPenalty.save (err, result, numAffected)->
              if err
                return res.status(422).json(err)
                # TODO: FInish
                # console.log newUserPenalty._id
                User.findOne _id : req.user.id, (userError, userResult) ->
                  # console.log userResult
                  return
              return res.status(200).json message : numAffected
              # TODO: Before saving penalty, verify if user status on list is blocked
              # TODO: Insert penalty to user list###
        else
          addMatchToUserList(req.user, list_id, 'pull')
          List.findByIdAndUpdate { '_id' : list_id }, { $pull: 'names': full_name : full_name }, (err, model) ->
            if err
              res.send 'err: ' + String(err)
              return
            else
              res.send model
              return
            return


  app.get '/matches/match/:listid', isLoggedIn,(req, res) ->

    listid              = req.params.listid
    player_id           = req.user._id
    player_is_blocked   = false
    player_is_on_list   = false

    List.aggregate(
        { $match   : $and: [ 
              {
                _id : ObjectId(listid)
              }
            ]
        },
        { $project : {
            names: { $filter: {
                input: '$names',
                as: 'name',
                cond: { $and: [
                    {$eq: ['$$name.status', 'blocked']},
                    {$eq: ['$$name.player_id', ObjectId(player_id) ]}
                  ] }
            }},
            _id: 0
        }}
    , (err, result)->
        if err
            console.log err

        if result[0].names[0] != undefined
            player_is_blocked = true
    )

    List.find
      '_id'   : listid,
      'names' : $elemMatch : 'full_name' : req.user.facebook.full_name, (err, sec_res) ->

        player_is_on_list = if sec_res.length <= 0 then false else true

        ###List.aggregate(
            { $match   : $and: [ 
                  {
                    _id : ObjectId(listid)
                  }
                ]
            },
            { $project : {
                names: { $filter: {
                    input: '$names',
                    as: 'name',
                    cond: {$eq: ['$$name.status', 'playing']}
                }},
                _id: 1, list_date   : 1, list_status :1,list_size :1
            }}
        ,###
        List.findOne _id : ObjectId(listid),
        (err, list)->
            if err
                console.log err
                res.send err

            res.render     'matches/match_details.ejs',
            message           : req.flash('loginMessage')
            list              : list
            match_date        : moment(list.list_date).format("dddd, MMMM Do YYYY, h             : mm : ss a");
            user              : req.user
            player_is_blocked : player_is_blocked
            player_is_on_list : player_is_on_list
            moment            : moment
            disabled          : if list.list_status == 'deactivate' then 'disabled' else ''
            title             : "Match"
            ###message           : req.flash('loginMessage')
            list              : list[0]
            match_date        : moment(list[0].date).format("dddd, MMMM Do YYYY, h             : mm : ss a");
            user              : req.user
            player_is_blocked : player_is_blocked
            player_is_on_list : player_is_on_list
            moment            : moment
            disabled          : if list[0].list_status == 'deactivate' then 'disabled' else ''
            title             : "Match"###


    return

  app.post '/matches/match/details/:listid', (req, res) ->

    ###current_list_length = 0

    List.aggregate(
        { $match   : $and: [ 
              {
                _id : ObjectId(listid)
              }
            ]
        },
        { $project: { count: { $size:"$names" }}}, (err, result)->
            current_list_length = result[0].count
            console.log "current_list_length",current_list_length
    )###

    player_is_blocked   = false

    List.aggregate(
        { $match   : $and: [ 
              {
                _id : ObjectId(listid)
              }
            ]
        },
        { $project : {
            names: { $filter: {
                input: '$names',
                as: 'name',
                cond: { $and: [
                    {$eq: ['$$name.status', 'blocked']},
                    {$eq: ['$$name.player_id', ObjectId(player_id) ]}
                  ] }
            }},
            _id: 0
        }}
    , (err, result)->
        if err
            console.log err

        if result[0].names[0] != undefined
            player_is_blocked = true
    )

    ###List.aggregate(
        { $match   : $and: [ 
              {
                _id : ObjectId(listid)
              }
            ]
        },
        { $project : {
            names: { $filter: {
                input: '$names',
                as: 'name',
                cond: {$eq: ['$$name.status', 'playing']}
            }},
            _id: 1, list_date   : 1, list_status :1,list_size :1,
        }}###
    List.findOne _id : ObjectId(listid)
    , (err, result)->
        if err
            console.log err
            res.send err
        console.log result
        res.send result

  app.get '/matches/match/details/:listid', isLoggedIn, (req, res) ->    
    ###List.aggregate [
      { $match: _id: ObjectId(req.params.listid) }
      { $project:
        names: $filter:
          input: '$names'
          as: 'names'
          cond: $eq: [
            '$$names.status'
            'playing'
          ]
        _id: 0, list_date:1, list_status:1, list_size : 1 }
    ]###
    List.findOne _id : ObjectId(req.params.listid)
    , (err, result) ->
      if err
        return console.log('err', err)
      console.log result
      res.render 'matches/match_list_details.ejs',
      message    : req.flash('loginMessage')
      list       : result
      match_date : moment(result.list_date).format("dddd, MMMM Do YYYY, h : mm : ss a");
      user       : req.user
      title      : "Match: details"
      ###console.log result[0]
      res.render 'matches/match_list_details.ejs',
      message    : req.flash('loginMessage')
      list       : result[0]
      match_date : moment(result[0].list_date).format("dddd, MMMM Do YYYY, h : mm : ss a");
      user       : req.user
      title      : "Match: details"###
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

      console.log 'saving a new match'

      match.save (err, result, numAffected)->
        util = require('util')
        if err
          console.log err
          res.json( { message : err } )

        res.json({ message: String(numAffected) + ' rows affected' });
    res.send "nothing received"

  app.post '/matches/update', isLoggedIn, (req, res, next) ->

    list_id     = req.body.list_id
    list_date   = req.body.list_date
    list_status = req.body.list_status
    list_size   = req.body.list_size

    if list_id == '' || list_status == '' || list_date == '' || list_size < 0
      res.json {'message' : 'wrong params'}
      return

    List.update 
      '_id' : list_id,
        '$set' : 
          'list_size'   : list_size
          'list_status' : list_status
          'list_date'   : list_date
    ,(err, numAffected) ->
      if err
        res.json({message: err})
      else
        if numAffected > 0
          res.json({ message: 'ok' });
        else
          res.json({ message: String(numAffected) + ' rows affected' });
          return
        return