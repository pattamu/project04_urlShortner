const shortid = require('shortid')
const urlModel = require('../model/urlModel')

const isValid = value => {
    if(typeof value === 'undefined' || value === null ) return false
    if(typeof value === 'string' && value.trim().length === 0 ) return false
    return true
}

const validateURL = url => {
    var urlPattern = /^(http(s)?:\/\/)?(www.)?([a-zA-Z0-9])+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/[^\s]*)?$/gm
    return urlPattern.test(url.trim());
}

const checkid = val => {
    let id = shortid.generate()
    let check = val.some(x => x.urlCode == id)
    if(check) checkid(val)
    else return id
}

const createUrl = async (req, res) => {
    try{
        let data = req.body

        if(!Object.keys(data).length || !isValid(data.longUrl))
            return res.status(400).send({status: false, message: "Please enter your URL."}) 

        if(!validateURL(data.longUrl))
            return res.status(400).send({status: false, message: "Enter a Valid URL."})

        let findUrl = await urlModel.findOne({longUrl: data.longUrl})
        if(findUrl)
            return res.status(200).send({status: false, message: "Url already present. Here's the short URL ->", 
            data: {
                longUrl: findUrl.longUrl, 
                shortUrl: findUrl.shortUrl, 
                urlCode: findUrl.urlCode
            }})

        let checkShortId = await urlModel.find()
        let id = checkid(checkShortId)

        data.urlCode = id
        data.shortUrl = `http://localhost:3000/${id}`

        let createUrl = await urlModel.create(data)
        res.status(201).send({status: true, message: 'Data successfully created.', data: {
            longUrl: createUrl.longUrl,
            shortUrl: createUrl.shortUrl,
            urlCode: createUrl.urlCode
        } })

    }catch(err){
        res.status(500).send({status: false, message: err.message})
    }
}

const getUrl = async (req, res) => {
    try{
        let findUrl = await urlModel.findOne({urlCode: req.params.urlCode})
        if(!findUrl)
            return res.status(404).send({status: false, message: 'URL not found.'})

        res.status(200).send({status: true, message: 'Redirecting to Original URL.', data: findUrl.longUrl})
        // res.redirect(findUrl.longUrl)
    }catch(err){
        res.status(500).send({status: false, message: err.message})
    }
}


module.exports = {createUrl, getUrl}