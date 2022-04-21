const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    nama:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error('Email Tidak Valid')
            }
        }
    },
    password:{
        type:String,
        required:true,
        minLength:6,
        trim:true,
        validate(value){
            if (value.toLowerCase().includes('password')){
                throw new Error('Password Tidak Boleh Mengandung Kata `Password` ')
            }
        }
    },
    biodata:{
        type:String,
        required:false,
        trim:true,
        default:'Hi!',
    },
    role:{
        type:Number,
        required:true,
        default:'1',
    },
    avatar:{
        type:Buffer,
    }
},{
    timestamps:true
})


userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = await jwt.sign({
        _id: user._id.toString(),
        email:user.email
    }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})

    await user.save()

    return token
}

userSchema.methods.toJSON =  function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email})
    if (!user){
        throw new Error('Login gagal')
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if (!isMatch){
        throw new Error('Login gagal')
    }
    return user
}

//Hash password biasa sebelum di save
userSchema.pre('save',async function (next){
    const user = this
    if (user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})
const User = mongoose.model('User',userSchema)

module.exports = User