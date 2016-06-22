List    = require '../models/list'
User    = require '../models/user'

isLoggedIn = (req, res, next) ->
  if req.isAuthenticated()
    return next()
  res.redirect '/'
  return

module.exports = (app) ->

    app.get '/controlpanel', isLoggedIn, (req, res) ->
        res.render 'controlpanel/index.ejs',
        title: 'Control Panel'
        return
        
    app.post '/controlpanel/matches/list', isLoggedIn, (req, res) ->
        List.find {}, (err, list) ->
            console.log list
            if err
                res.send err
                return
            res.render 'matches/list.ejs',
            message : req.flash('loginMessage')
            lists   : list,
            user    : req.user
            title   : "Matches Lists"
            return
        return