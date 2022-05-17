const mongoose = require('mongoose')
const shortId = require('shortid')
const urlModel = require('../model/urlModel')

const isValid = value => {
    if(typeof value === 'undefined' || value === null ) return false
    if(typeof value === 'striing' && value.trim().length === 0 ) return false
    return true
}

const validateURL = url => {
    var urlPattern = /^(http(s)?:\/\/)?(www.)?([a-zA-Z0-9])+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/[^\s]*)?$/gm
    return urlPattern.test(url.trim());
}

const createUrl = (req, res) => {
    try{
        let data = req.body

        if(!Object.keys(data).length)
            return res.status(400).send({status: false, message: "Please enter data for URL."}) 
        
        if(!isValid(data.longUrl))
            return res.status(400).send({status: false, message: "Please enter data for URL."}) 
            
    }catch(err){
        res.status(500).send({status: false, message: err.message})
    }
}

const getUrl = (req, res) => {
    try{
        
    }catch(err){
        res.status(500).send({status: false, message: err.message})
    }
}


module.exports = {createUrl, getUrl}