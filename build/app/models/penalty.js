var ObjectId, PenaltySchema, Schema, mongoose;

mongoose = require('mongoose');

Schema = mongoose.Schema;

ObjectId = Schema.ObjectId;

PenaltySchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, {
  collection: 'penalty'
});

module.exports = mongoose.model('Penalty', PenaltySchema);
