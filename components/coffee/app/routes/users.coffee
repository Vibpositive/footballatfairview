User    = require '../models/user'
List    = require '../models/list'
_       = require 'underscore'
moment  = require 'moment'

isLoggedIn = (req, res, next) ->
  if req.isAuthenticated()
    return next()
  res.redirect '/'
  return

module.exports = (app) ->
  app.get '/users', isLoggedIn, (req, res) ->
    User.find {}, (err, list) ->
      res.render 'users/index.ejs',
      list: list
      user: req.user
      users: list
      title: 'users'
      return

  app.post '/users', (req, res) ->
      User.find {}, (err, list) ->
        res.json (list)
      return

  app.get '/user/:user_id', (req, res) ->

    User.findOne { _id : req.params.user_id}, (err, userResultes_query) ->

      List.find { list_status : 'active' }, (l_err, listResultes_query) ->

        userActiveLists = []
        isUserInTheList = false

        _.each userResultes_query.matches, (userList) ->

          _.each listResultes_query, (list) ->

            _.find list.names, (list_)->

              isUserInTheList = String(list_.player_id) == String(userResultes_query._id)

              return isUserInTheList

            if String(userList) == String(list._id) and isUserInTheList == true

              userActiveLists.push list
              return

          return

        res.render 'users/details.ejs',
        user_found : userResultes_query
        user_lists : userActiveLists
        title      : 'users'
        moment : moment
        return
  return