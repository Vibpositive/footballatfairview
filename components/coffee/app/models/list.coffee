mongoose = require('mongoose')
bcrypt = require('bcrypt-nodejs')
moment = require('moment')
listSchema = mongoose.Schema({
  id         : String
  list_date  :
    type     : String
    required : true
  list_size  :
    type     : String
    required : true
  names      :
    type     : Array
    default  : []
  list_status:
    type     : String
    required : true
    enum     : [
      'inactive'
      'active'
      'admins'
      'preferential'
      'pending'
    ]
}, timestamps: createdAt: 'created_at')

module.exports = mongoose.model('List', listSchema)