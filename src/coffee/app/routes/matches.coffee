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
  # TODO: implement isLoggedIn in the request
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

removeMatchFomUser = (player_id, match, next) ->
  deferred = Q.defer()
  User.findByIdAndUpdate { _id: ObjectId(player_id) },
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

  # TODO Whenever a player removes their name from a match, a routine has to
  # run in order to check list size and automatically push players
  # from the waiting list to the actual list
  app.post '/match/participate', isLoggedIn, (req, res) ->
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

    if req.body.player_status == 'playing' || req.body.player_status == 1

      List.findOneAndUpdate {
        _id: list_id,
        'names.player_id': { $ne: ObjectId(user.player_id) }
      },{
        $push: {
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
      },
      {
        'new': true
        'rawResult': false
      }, (err, doc) ->
        if err
          errMessage = err.message

        message = if doc then "Added to the match" else "User already on match"

        addMatchToUser(user, list_id)
        return res.json {
          "message": message
          "errMessage": errMessage
        }

    else if req.body.player_status == 'not playing' ||
    req.body.player_status == 0
      List.findOneAndUpdate {
        '_id': list_id,
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

          removeMatchFomUser(user.player_id, list_id).then(data) ->
            console.log data

          return res.json {
            "message": ""
            "list": list
            "errMessage": errMessage
          }
        else
          return res.json {
            "message": "User is not in list",
            "updated": 0,
            "errMessage": ""
          }
    else
      return res.json {
        "message": "Inform a valid status",
        "errMessage": "A valid status has not been informed"
      }

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
        player_is_on_list: if player_is_on_list then true else false
        moment: moment
        disabled: if list.list_status == 'deactivate' then 'disabled' else ''
        title: "Match"
    return

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

  # Show a view to create matches
  app.get '/matches/create', isLoggedIn, (req, res) ->
    res.render 'matches/create.ejs', title: 'Create a match'
    return

  # Show all matches in a edit view
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

  # Show a match in a edit view
  app.get '/matches/edit/:list_id', isLoggedIn, (req, res, next) ->
    list_id     = req.params.list_id
    List.findOne { _id: list_id }, {},(err, doc) ->
      if err
        return { message: err }
      else
        res.render 'matches/edit.ejs',
        message: ''
        list: doc
        user: req.user
        moment: moment
        title: 'Matches List'
        return
    return

  app.post '/match/remove/player',
  isLoggedIn, (req, res, next) ->

    paramError = false
    errors = {}
    list_id       = req.body.list_id
    player_status = req.body.player_status
    player_id     = req.body.player_id

    if typeof list_id is 'undefined' || list_id == ''
      errors.list_id = "Match ID not informed correctly"
      paramError = true

    if typeof player_status is 'undefined' ||
    player_status == ''
      errors.player_status = "Player status not informed correctly"
      paramError = true

    if typeof player_id is 'undefined' || player_id == ''
      errors.player_id = "Player ID full name not informed correctly"
      paramError = true

    if paramError
      return res.json {
        "message": "Please inform all params",
        "errors": errors
        "errMessage": "Params have not been informed correctly"
      }


    List.findOneAndUpdate {
      '_id': list_id
      'names.player_id': ObjectId(player_id)
    },{
      $pull: {
        names: {
          player_id: ObjectId(player_id)
        }
      }
    }, {
      'new': true
      'rawResult': false
    }, (err, doc) ->
      if err
        return res.json {
          "message": "",
          "doc": doc
          "errMessage": err.message
        }
      if not doc
        return res.json {
          "message": "Player not in this match",
          "errMessage": "Please inform a valid match and user"
        }

      User.findOne {
        '_id': ObjectId(player_id)
      }, (err, user) ->
        _user = {
          "player_id": ObjectId(player_id)
          "datetime": 'date'
          "last_name": user.facebook.last_name
          "first_name": user.facebook.first_name
          "full_name": user.facebook.full_name
          "status": "playing"
          "phone": user.phone
        }

        removeMatchFomUser(user._id, list_id)

        result = _.find doc.names, (val) ->
          return _.isEqual(_user, val)

        if not result
          return res.json {
            "message": "Removed successfully"
            "errMessage": ""
            "doc": doc
          }
        else
          return res.json {
            "message": "No update has happened"
            "errMessage": "An Unknow error occurred"
          }

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
      return res.json {
        "message": "Please inform all params",
        "errMessage": "Params have not been informed correctly"
      }

    List.update
      '_id': list_id,
        '$set':
          'list_size': list_size
          'list_status': list_status
          'list_date': list_date
    ,(err, data) ->

      if err
        res.json {
          "message": "Error",
          "errMessage": err.message
        }
        return
      else
        if data.nModified > 0
          return res.json {
            "message": "Updated successfully",
            "errMessage": ""
          }

        else
          return res.json {
            "message": "Updated unsuccessfully",
            "errMessage": ""
          }

      return
    return
  return
