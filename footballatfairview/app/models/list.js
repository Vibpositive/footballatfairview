// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var moment   = require('moment');

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
	list_date   : { type: String , required: true },
	list_size   : { type: String , required: true },
	names       : { type: Array  , default: [] },
	list_status : { type: String , required: true  , enum: ['inactive', 'active', 'admins'] },
	date        : { type: Date   , default: moment().format("DD-MM-YYYY") }
}, { timestamps: { createdAt: 'created_at' } });

// create the model for list and expose it to our app
module.exports = mongoose.model('List', listSchema);