const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose').default;

const userSchema=new Schema({
    email:{
        type: String,
        required: true,
    },
     googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    displayName: {
        type: String
    },
    profilePicture: {
        type: String
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);