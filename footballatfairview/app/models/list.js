var bcrypt, listModel, listSchema, moment, mongoose;

mongoose = require('mongoose');

bcrypt = require('bcrypt-nodejs');

moment = require('moment');

listSchema = mongoose.Schema({
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
    "default": []
  },
  list_status: {
    type: String,
    required: true,
    "enum": ['inactive', 'active', 'admins', 'preferential', 'pending']
  }
}, {
  timestamps: {
    createdAt: 'created_at'
  }
});

listModel = mongoose.model('List', listSchema);

listSchema.pre('save', function(next) {
  var self;
  self = this;
  listModel.find({
    list_date: self.list_date
  }, function(err, docs) {
    if (!docs.length) {
      next();
    } else {
      next(new Error('Match exists!'));
    }
  });
});

module.exports = mongoose.model('List', listSchema);
