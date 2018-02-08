List        = require '../models/list'
User        = require '../models/user'
moment      = require 'moment'
uuid        = require 'node-uuid'
_           = require "underscore"
Penalty     = require '../models/penalty'
UserPenalty = require '../models/user_penalty'
ObjectId    = require('mongodb').ObjectID
Q           = require('q')

isLoggedIn = (req, res, next) ->
  # TODO: remove return next()
  return next()
  if req.isAuthenticated()
    return next()
  res.redirect '/'
  return

# TODO: disable edit access if match has already happened

addMatchToUser = (user, match, next) ->
  deferred = Q.defer()
  User.update { _id: ObjectId(user.player_id) },
  { $addToSet: { 'matches': match } },
  (err, numAffected) ->
    if err
      deferred.resolve err
    deferred.resolve numAffected
  return deferred.promise

removeMatchFomUser = (user, match, next) ->
  deferred = Q.defer()
  User.findByIdAndUpdate { _id: ObjectId(user.player_id) },
  {
    $pull: 'matches': match
  },
  {
    'new': true
  }, (err, doc) ->
    if err
      errMessage = err.message
    deferred.resolve doc.matches.indexOf(match)
  return deferred.promise

getTimeToMatch = (list) ->
  currentTime = moment()
  matchTime = moment(list.list_date, "x")
  diffMinutes = matchTime.diff(currentTime, 'minutes')
  return diffMinutes

addPenaltyToUser = (user, match, next) ->
  # TODO: implement Q
  User.findByIdAndUpdate {
    _id: user.player_id,
    matches: {
      $in: [match]
    }
  },
  {
    $inc: { penalties: 1 }
  },
  (err, doc) ->
    undefined

addUserToMatch = (list_id, user, req) ->
  # TODO: check size of players list
  deferred = Q.defer()
  List.update {
    '_id': list_id
  },{
    $addToSet: {
      'names': {
        player_id: user.player_id
        datetime: 'date'
        last_name: user.last_name
        first_name: user.first_name
        full_name: user.full_name
        status: "playing"
        phone: user.phone
      }
    }
  },(err, numAffected) ->
    if err
      deferred.resolve err
    deferred.resolve numAffected
  return deferred.promise

# f_removePenaltyFromUser = (list_id) ->
#   console.log "f_removePenaltyFromUser",f_removePenaltyFromUser
#   deferred = Q.defer()
#
#   List.aggregate {
#     $match: $and: [ { _id: ObjectId(list_id) } ] },
#       { $project: {
#         names: { $filter: {
#           input: '$names',
#           as: 'name',
#           cond: { $and: [
#             {$eq: ['$$name.player_id', ObjectId(player_id) ]}
#           ] }
#         }},
#         _id: 0
#       }} , (err, resultado) ->
#         if err
#           console.log err
#           deferred.resolve err
#         penalty_id = resultado[0].names[0].penalty_id
#         deferred.resolve penalty_id
#
#         UserPenalty.findByIdAndRemove _id: ObjectId(penalty_id),
#         (err, result) ->
#           # TODO: Validate result
#   return deferred.promise

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

  app.post '/matches/views/playerslist', isLoggedIn, (req, res) ->
    List.findOne {_id: req.body.list_id }, (err, list) ->
      if err
        res.send err
        return
      res.render 'matches/names/names_list.ejs',
      message: req.flash('loginMessage')
      list: list
      user: req.user
      moment: moment
      title: "Matches index"
      return
    return

  app.post '/matches/participate', isLoggedIn, (req, res) ->
    list_id = req.body.list_id
    errMessage = ""
    user = {}
    updated = 0
    inputFault = false

    user.player_id = if req.user
    then new ObjectId(req.user.id)
    else new ObjectId(req.body.player_id)

    user.datetime   = if req.user
    then 'date'
    else 'date'

    user.last_name  = if req.user
    then req.user.facebook.last_name
    else req.body.last_name

    user.first_name = if req.user
    then req.user.facebook.first_name
    else req.body.first_name

    user.full_name  = if req.user
    then req.user.facebook.first_name + " " + req.user.facebook.last_name
    else req.body.first_name + " " + req.body.last_name

    user.phone      = if req.user
    then req.user.phone
    else req.body.phone

    for prop of user
      if not user[prop]?
        res.json {
          "message": "Please inform all params",
          "errMessage": "Params have not been informed correctly"
        }
        return

    if req.body.player_status == 'playing'
      List.findOne _id: list_id, 'names.player_id': user.player_id,
      (err, doc) ->
        if err
          errMessage = err.message

        if not doc
          addUserToMatch(list_id, user).then (data) ->
            res.json {
              "message": "Added to the match",
              "updated": data.nModified,
              "errMessage": errMessage
            }
            undefined

          addMatchToUser(user, list_id).then (data) ->
            # res.json {
            #   "message": "Success",
            #   "updated": data.nModified,
            #   "errMessage": errMessage
            # }
            undefined
          undefined
        else
          res.json {
            "message": "Already on the match",
            "updated": 0,
            "errMessage": errMessage
          }
          undefined

    else if req.body.player_status == 'not playing'
      List.findOneAndUpdate {
        '_id': list_id,
        # "names.player_id": { $eq: user.player_id }
      },{
        $pull: 'names': 'player_id': user.player_id
      },
      {
        'new': true
      }, (err, list) ->
        if err
          errMessage = err.message

        if list
          timeToMatch            = getTimeToMatch(list)
          if timeToMatch < 360
            penalty = true
            addPenaltyToUser(user, list_id)

          removeMatchFomUser(user, list_id)

          res.json {
            "message": ""
            "list": list
            "errMessage": errMessage
          }
        else
          res.json {
            "message": "User is not in list",
            "updated": 0,
            "errMessage": ""
          }
    else
      res.json {
        "message": "Inform a valid status",
        "errMessage": "A valid status has not been informed"
      }
      undefined

  app.get '/matches/match/:list_id', isLoggedIn,(req, res) ->
    list_id             = req.params.list_id
    player_id           = req.user.id

    List.findOne '_id': list_id,
    (err, doc) ->

      player_is_on_list = _.find doc.names,
      (player) ->
        return String(player.player_id) == String(player_id)

      List.findOne _id: ObjectId(list_id),(err, list) ->
        if err
          console.log err
          res.send err
        res.render     'matches/match_details.ejs',
        message: req.flash('loginMessage')
        list: list
        match_date: moment(list.list_date, "x")
        user: req.user
        # TODO: remove option
        player_is_blocked: false
        player_is_on_list: if player_is_on_list then true else false
        moment: moment
        disabled: if list.list_status == 'deactivate' then 'disabled' else ''
        title: "Match"


    return

  app.post '/matches/match/details/:list_id', (req, res) ->

    player_is_blocked   = false

    List.aggregate(
      { $match: $and: [
            {
              _id: ObjectId(list_id)
            }
          ]
      },
      { $project: {
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
    , (err, result) ->
      if err
        console.log err

      if result[0].names[0] != undefined
        player_is_blocked = true
    )

    List.findOne _id: ObjectId(list_id), (err, result) ->
      if err
        console.log err
        res.send err

      res.send result

  app.get '/matches/match/details/:list_id', isLoggedIn, (req, res) ->

    List.findOne _id: ObjectId(req.params.list_id)
    , (err, result) ->
      if err
        return console.log('err', err)

      res.render 'matches/match_list_details.ejs',
      message: req.flash('loginMessage')
      list: result
      match_date: moment(result.list_date, 'x')
      user: req.user
      title: "Match: details"

      return
    return

  app.get '/matches/create', isLoggedIn, (req, res) ->
    res.render 'matches/create.ejs', title: 'Create a match'
    return

  app.get '/matches/edit', isLoggedIn, (req, res) ->
    List.find {}, (err, list) ->
      if err
        res.send err
        return
      res.render 'matches/list.ejs',
      message: req.flash('loginMessage')
      lists: list
      user: req.user
      moment: moment
      title: "Matches index"
      return

  app.get '/matches/edit/:list_id', isLoggedIn, (req, res, next) ->
    list_id     = req.params.list_id
    List.findOne { _id: list_id }, {},(err, listFound) ->
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
    return

  # TODO: Improve route trying using just one
  app.post '/matches/edit/match', isLoggedIn, (req, res, next) ->

    list_id       = req.body.list_id
    player_status = req.body.player_status
    full_name     = req.body.full_name
    player_id     = new ObjectId(req.body.player_id)

    if player_status == "remove"

      List.findByIdAndUpdate { '_id': list_id },
      {
        $pull: names: full_name: full_name,
        player_id: new ObjectId(player_id) }, (err, model) ->
          if err
            return res.status(422).json(err)
          List.findOne {_id: list_id, 'names.full_name': full_name},
          (err2, model2) ->
            if err
              return res.status(422).json(err2)
            res.status(200).json(model2)
            return
      return
    return

  app.post '/matches/create', isLoggedIn, (req, res, next) ->
    names = []
    isParticipating = req.body.names
    rowsAffected = 0
    message = ""
    errMessage = ""

    list_date   = req.body.list_date
    list_size   = req.body.list_size
    list_status = req.body.list_status

    if isParticipating == 'true'
      names = [{
        player_id: new ObjectId(req.user.id)
        datetime: 'date'
        last_name: req.user.facebook.last_name
        first_name: req.user.facebook.first_name
        full_name: req.user.facebook.first_name  + "  "+
        req.user.facebook.last_name
        phone: req.user.phone
        status: 'playing'
      }]

    match = new List(
      list_date: list_date,
      list_size: list_size,
      names: names,
      list_status: list_status,
      date: Date.now(),
      url: uuid.v1()
    )

    match.save (err, match, numAffected) ->
      if err
        if err.code == 11000
          errMessage =  "Inform a free timeslot"
        else
          message = "error"
          errMessage =  err.message

      if match and typeof err isnt 'undefined'
        message = "Match created successfully"
        errMessage =  ""
      else
        message = "Match not created"

      res.json {
        "message": message,
        "err": errMessage
      }
      return
    return

  app.post '/matches/update', isLoggedIn, (req, res, next) ->

    list_id     = req.body.list_id
    list_date   = req.body.list_date
    list_status = req.body.list_status
    list_size   = req.body.list_size

    if list_id == '' || list_status == '' || list_date == '' || list_size < 0
      res.json {'message': 'wrong params'}
      return

    List.update
      '_id': list_id,
        '$set':
          'list_size': list_size
          'list_status': list_status
          'list_date': list_date
    ,(err, numAffected) ->
      if err
        res.json({message: err})
      else
        if numAffected > 0
          res.json({ message: 'ok' })
          # res.json {
          #   "message": message,
          #   "err": errMessage
          # }
        else
          res.json({ message: String(numAffected) + ' rows affected' })
          # res.json {
          #   "message": message,
          #   "err": errMessage
          # }
          # return
        # return
      return
    return
  return
