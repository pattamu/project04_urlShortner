const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({ 
    urlCode: {
        type: String, 
        required:true, 
        trim: true, 
        unique:true, 
        lowercase: true
    }, 
    longUrl: {
        type: String, 
        required:true, 
        trim: true
    }, 
    shortUrl: {
        type: String, 
        required:true, 
        trim: true, 
        unique:true
    } 
},
{timestamps:true})

module.exports = mongoose.model('Urldata', urlSchema)