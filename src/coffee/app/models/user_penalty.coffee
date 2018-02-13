mongoose = require('mongoose')
bcrypt   = require('bcrypt-nodejs')
moment   = require('moment')
Schema   = mongoose.Schema
ObjectId = Schema.ObjectId

userPenaltySchema = mongoose.Schema({
  id: String
  player_id:
    type: ObjectId
    required: true
  penalty_id:
    type: ObjectId
    required: true
  match_id:
    type: ObjectId
}, timestamps: createdAt: 'created_at')

module.exports = mongoose.model('UserPenaltie', userPenaltySchema)
