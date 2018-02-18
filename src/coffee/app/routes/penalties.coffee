# footballatfairview/app/routes/penalties.coffee

List        = require '../models/list'
User        = require '../models/user'
Penalty     = require '../models/penalty'
UserPenalty = require '../models/user_penalty'

moment      = require 'moment'
uuid        = require 'node-uuid'
_           = require "underscore"
ObjectId    = require('mongodb').ObjectID

isLoggedIn = (req, res, next) ->
  if req.isAuthenticated()
    return next()
  res.redirect '/'
  return

module.exports = (app) ->

  app.get '/penalties', isLoggedIn, (req, res) ->
    res.render 'penalties/index.ejs',
    message: req.flash('loginMessage')
    user: req.user
    moment: moment
    title: 'Penalties'
    return

  app.get '/penalties/add', isLoggedIn, (req, res) ->
    Penalty.find {}, (penalty_err, penalties) ->
      if penalty_err
        return console.log penalty_err

      User.find {}, (user_err, users) ->
        if user_err
          return console.log user_err

        List.find {}, (list_err, matches) ->
          if list_err
            console.log list_err
            return

          res.render 'penalties/add.ejs',
          message: req.flash('loginMessage')
          users: users
          penalties: penalties
          matches: matches
          user: req.user
          moment: moment
          title: 'Penalties'
          return
        return
      return
    return

  # app.post '/penalties/add', isLoggedIn, (req, res) ->
  app.post '/penalties/add', (req, res) ->
    # TODO validate params

    player_id  = req.body.player_id
    penalty_id = req.body.penalty_id
    match_id   = req.body.match_id

    newUserPenalty = new UserPenalty
      player_id: player_id
      penalty_id: penalty_id
      match_id: match_id

    newUserPenalty.save (err, result, numAffected) ->
      if err
        console.log err
        return res.status(422).json {message: err}
      res.json { message: newUserPenalty._id }
      return
    return


  app.get '/penalty/create', isLoggedIn, (req, res) ->
    List.find {}, (err, list) ->
      if err
        return console.log err
      res.render 'penalties/create.ejs',
      message: req.flash('loginMessage')
      lists: list
      user: req.user
      moment: moment
      title: 'Penalties'
      return
    return

  # app.post '/penalties/create', isLoggedIn, (req, res) ->
  app.post '/penalty/create', (req, res) ->

    try
      title = req.body.title
      description = req.body.description
    catch error
      # TODO
    errors = {}

    if typeof title is 'undefined' || title == ''
      errors.title = "Title not informed"
      paramError = true

    if typeof description is 'undefined' || description == ''
      errors.description = "Description not informed"
      paramError = true

    if paramError
      return res.json {
        "message": "Please inform all params",
        "errors": errors
        "errMessage": "Params have not been informed correctly"
        "params": req.body
      }

    penalty = new Penalty
      title: title
      description: description

    penalty.save (err, result, numAffected) ->
      if err
        console.log err
        return res.json {
          "message": err.message
          "errors": err
        }
      return res.json {
        "message": "Created successfully",
      }
    return

  app.get '/penalty/edit/', isLoggedIn, (req, res) ->
    Penalty.find {}, (err, penalties) ->
      if err
        return console.log err
      console.log penalties
      res.render 'penalties/list.ejs',
      message: req.flash('loginMessage')
      penalties: penalties
      user: req.user
      moment: moment
      title: 'Penalties'
      return
    return

  app.get '/penalty/edit/:penalty_id', isLoggedIn, (req, res) ->
    # TODO validate params
    penalty_id     = req.params.penalty_id
    Penalty.findOne { _id: penalty_id}, (err, penalty) ->
      if err
        return console.log err
      res.render 'penalties/penalty.ejs',
      message: req.flash('loginMessage')
      penalty: penalty
      user: req.user
      moment: moment
      title: 'Penalty'
      return
    return

  app.get '/penalties/view', isLoggedIn, (req, res) ->
    List.find {}, (err, list) ->
      if err
        return console.log err
      res.render 'penalties/view.ejs',
      message: req.flash('loginMessage')
      lists: list
      user: req.user
      moment: moment
      title: 'Penalties'
      return
    return

  # app.post '/penalty/delete', isLoggedIn, (req, res) ->
  app.post '/penalty/delete', (req, res) ->

    try
      penalty_id = req.body.penalty_id
    catch error
      return res.json {
        "errMessage": error
      }

    errors = {}

    if typeof penalty_id is 'undefined' || penalty_id == ''
      errors.penalty_id = "Penalty ID not informed"
      paramError = true

    if paramError
      return res.json {
        "message": "Please inform all params",
        "errors": errors
        "errMessage": "Params have not been informed correctly"
        "params": req.body
      }

    Penalty.deleteOne {_id: penalty_id}, (err, result) ->
      if err
        console.log err

      if result.n > 0
        return res.json {
          "message": "Deleted successfully"
        }

      return res.json {
        "message": "Operation failed"
        "errMessage": "0 Documents have been deleted"
      }
    return
  return
