// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our list model
/*var listSchema = mongoose.Schema({
	list      : {
		id        : String,
		list_date : String,
		list_size : String,
		names     : Array,
		date      : String
	}
});*/

var listSchema = mongoose.Schema({
	id          : String,
	list_date   : String,
	list_size   : String,
	names       : Array,
	list_status : String,
	date        : String
});

// create the model for list and expose it to our app
module.exports = mongoose.model('List', listSchema);