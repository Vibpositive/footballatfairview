List    = require '../models/list'
User    = require '../models/user'

isLoggedIn = (req, res, next) ->
  if req.isAuthenticated()
    return next()
  res.redirect '/'
  return

module.exports = (app) ->

    app.get '/controlpanel', isLoggedIn, (req, res) ->
        res.render 'cp/index.ejs',
        title: 'Control Panel'
        return
        
    app.post '/controlpanel/matchs/list', isLoggedIn, (req, res) ->
        List.find {}, (err, list) ->
            console.log list
            if err
                res.send err
                return
            res.render 'matchs/list.ejs',
            message : req.flash('loginMessage')
            lists   : list,
            user    : req.user
            title   : "Matches Lists"
            return
        return