express = require 'express'
router  = express.Router()
List    = require '../models/list'
User    = require '../models/user'

isLoggedIn = (req, res, next) ->
  if req.isAuthenticated()
    return next()
  res.redirect '/'
  return

router.get '/', isLoggedIn, (req, res) ->
    res.render 'cp/index.ejs',
    title: 'Control Panel'
    return
    
router.post '/matchs/list', isLoggedIn, (req, res) ->
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

module.exports = router