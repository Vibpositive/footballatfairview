var bcrypt, matchModel, matchSchema, moment, mongoose;

mongoose = require('mongoose');

bcrypt = require('bcrypt-nodejs');

moment = require('moment');

matchSchema = mongoose.Schema({
  id: String,
  list_date: {
    type: String,
    required: true,
    unique: true
  },
  list_size: {
    type: String,
    required: true
  },
  names: {
    type: Array,
    default: []
  },
  list_status: {
    type: String,
    required: true,
    enum: ['inactive', 'active', 'admins', 'preferential', 'pending']
  }
}, {
  timestamps: {
    createdAt: 'created_at'
  }
});

matchModel = mongoose.model('Match', matchSchema);

matchSchema.pre('save', function(next) {
  var self;
  self = this;
  // console.log self.list_date
  return matchModel.find({
    list_date: self.list_date
  }, function(err, docs) {
    // console.log "numAffected", numAffected
    // TODO: inform that match exists
    if (docs.length === 0) {
      // console.log "here", numAffected
      // if numAffected == 1
      return next();
    } else {

    }
  });
});

// console.log docs.length
// next new Error('Match exists!')
// return
// return numAffected
// return
// else
// res.json { numAffected: numAffected}
module.exports = mongoose.model('Match', matchSchema);
