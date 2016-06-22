User    = require '../models/user'

isLoggedIn = (req, res, next) ->
  if req.isAuthenticated()
    return next()
  res.redirect '/'
  return

module.exports = (app) ->
    app.get '/user', isLoggedIn, (req, res) ->
        res.render 'users/index.ejs',
        user: req.user
        title: 'users'
        return

    app.post '/users/nada', isLoggedIn, (req, res) ->
        User.find {}, (err, list) ->
            if err
                return console.log err
            res.send 'matches/index.ejs'
            return
        return