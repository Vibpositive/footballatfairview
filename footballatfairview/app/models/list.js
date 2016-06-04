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
	id          : String         ,
	list_date   : { type: String , required: true }    ,
	list_size   : { type: String , required: true }    ,
	names       : { type: Array  , required: true }    ,
	list_status : { type: String , required: true, enum: ['inactive', 'active'] }    ,
	date        : { type: Date   , default: Date.now }
});

// create the model for list and expose it to our app
module.exports = mongoose.model('List', listSchema);