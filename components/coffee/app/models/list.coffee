mongoose  = require('mongoose')
bcrypt    = require('bcrypt-nodejs')
moment    = require('moment')

listSchema = mongoose.Schema({
  id         : String
  list_date  :
    type     : String
    required : true
    unique   : true
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

listModel = mongoose.model('List', listSchema)

listSchema.pre 'save', (next) ->
  self = this
  listModel.find { list_date: self.list_date }, (err, docs) ->
    if !docs.length
      next()
    else
      next new Error('Match exists!')
    return
  return

module.exports = mongoose.model('List', listSchema)