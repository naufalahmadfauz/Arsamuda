const mongoose = require('mongoose')
const validator = require('validator')

const mailSchema = new mongoose.Schema({
    email:{
        type:String,
        lowercase:true,
        required:true,
        unique:true,
        trim:true,
        validate(value) {
            if (!validator.isEmail(value)){
                throw new Error('Email Tidak Valid!')
            }
        }
    }
},{
    timestamps:true
})

const Mail = mongoose.model('Mail',mailSchema)

module.exports = Mail