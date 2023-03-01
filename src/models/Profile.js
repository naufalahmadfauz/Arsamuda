const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    fullName:{
      type:String,
      required:true,
      trim:true,
    },
    displayName:{
        type:String,
        required:false,
        trim:true,
        unique:true,
    },
    aboutMe:{
        type:String,
        required:false,
        trim:true,
        default:'Hi!',
    },
    role:{
        type:String,
        required:true,
        default:'User',
    },
    birthDate:{
        type:Date,
        required:true,
    },
    gender:{
      type:String,
      required:true,
      trim:true,
      default:'Unspecified'
    },
    avatar:{
        type:String,
        required:false,
    }

},{
    timestamps:true
})

const Profile = mongoose.model('Profile',profileSchema)
module.exports = Profile