###mongoose = require('mongoose')

penaltySchema = mongoose.Schema({
	gravity : 
		type : Number
		required : true
	description : 
		type : String
		required : true
})

module.exports = mongoose.model('Penalty', penaltySchema)###
mongoose = require('mongoose')
Schema   = mongoose.Schema
ObjectId = Schema.ObjectId

PenaltySchema = mongoose.Schema({
	gravity : 
		type : Number
		required : true
	description : 
		type : String
		required : true
}, { collection: 'penalty' })


module.exports = mongoose.model('Penalty', PenaltySchema)