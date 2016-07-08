var mongoose, penaltiesSchema;

mongoose = require('mongoose');

penaltiesSchema = mongoose.Schema({
  id: String,
  gravity: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Penalties', penaltiesSchema);
