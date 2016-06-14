express = require 'express'
router  = express.Router()
User    = require '../models/user'

isLoggedIn = (req, res, next) ->
  if req.isAuthenticated()
    return next()
  res.redirect '/'
  return

router.get '/', isLoggedIn, (req, res) ->
    res.render 'profile/profile.ejs',
    user: req.user
    title: 'Profile'
    return

router.post '/edit/phoneNumber', (req, res) ->

    phoneNumber = req.body.phoneNumber
    userId      = req.user.id

    User.update _id : userId, { 'phone': phoneNumber },(err, numAffected) ->
        if err
            return { message: err }
        else
            if numAffected > 0
                res.send { message: 'ok' }
            else
                res.send { message: '0 rows affected' }

router.get '/view/details', (req, res) ->
    res.render 'profile/details.ejs',
    message    : req.flash('loginMessage')
    user       : req.user
    title      : 'Profile Details: ' + String(req.user.fullname)
    return
    
module.exports = router;