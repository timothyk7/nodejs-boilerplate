var Mongoose = require('mongoose');

var UserSchema = new Mongoose.Schema({
    "name": String
});

exports.User = Mongoose.model('User', UserSchema);