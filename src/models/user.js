const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

//Page Schema
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        trim: true
    },
    admin: {
        type: Number,
    }
});

UserSchema.statics.findByCredentials = async (username, password) =>{
    const user = await User.findOne({username: username});
    if(!user){
        throw new Error('Unabale to sign in')
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error('Unabale to sign in');
    }

    return user;
}

UserSchema.pre('save', async function(next) {
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8)
    }

    next();
})

const User = mongoose.model('User', UserSchema, 'users');

module.exports = User;
