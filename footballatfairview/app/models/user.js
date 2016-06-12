var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        full_name    : String,
        first_name   : String,
        last_name    : String,
        date         : 
        {
        	type: Date, default: Date.now
        }
    },
    matchs : { type: Array, default: [] },
    phone:
    {
        type: String,
        validate:
        {
            validator: function(v)
            {
                return /\d{3}-?\d{3}?-?\d{4}/.test(v);
            },
            message : '{VALUE} is not a valid phone number!'
        },
        default: '000-000-0000'
        // required: [true, 'User phone number required']
    }
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);