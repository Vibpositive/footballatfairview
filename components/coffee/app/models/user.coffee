mongoose = require('mongoose')
bcrypt = require('bcrypt-nodejs')
userSchema = mongoose.Schema(
  facebook     :
    id         : String
    token      : String
    email      : String
    full_name  : String
    first_name : String
    last_name  : String
    photos     : Array
    date       :
      type     : Date
      default  : Date.now
  matches       :
    type       : Array
    default    : []
  penalties    :
    type       : Array
    default    : []
  status       : 
    type       : String
    required   : true
  phone        :
    type       : String
    validate   :
      validator: (v) ->
        /\d{3}-?\d{3}?-?\d{4}/.test v
      message  : '{VALUE} is not a valid phone number!'
    default    : '000-000-0000')

userSchema.methods.generateHash = (password) ->
  bcrypt.hashSync password, bcrypt.genSaltSync(8), null

userSchema.methods.validPassword = (password) ->
  bcrypt.compareSync password, @local.password

userModel = mongoose.model('User', userSchema)

# TODO: check if penalty already exists for user
# TODO: check also on penalty collection
userSchema.pre 'save', (next)->
    self = this;
    userModel.find name : self.name , (err, docs)->
      if !docs.length
        next()
      else
        console.log 'user exists: ',self.name
        next new Error "User exists!"

module.exports = mongoose.model('User', userSchema)