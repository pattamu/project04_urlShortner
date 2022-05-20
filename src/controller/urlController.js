const shortid = require('shortid')
const urlModel = require('../model/urlModel')

const redis = require("redis");
const { promisify } = require("util");

/**********************************Connect to redis*****************************/
const redisClient = redis.createClient(
    13192,
    "redis-13192.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("XB8P0T1db0Y5cJ7Ss0dEwK17QMRGDMj3", function (err) {
    if (err) throw err;
});
redisClient.on("connect", async function () {
    console.log("Connected to Redis....");
});

// Connection setup for redis
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

/***************************Validation Functions*******************************/
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
/********************************************************************************/


const createUrl = async (req, res) => {
    try{
        let data = req.body

        if(!Object.keys(data).length || !isValid(data.longUrl))
            return res.status(400).send({status: false, message: "Please enter your URL."}) 

        if(!validateURL(data.longUrl))
            return res.status(400).send({status: false, message: "Enter a Valid URL."})

        /****************************************Search in Redis First******************************/
        let cachedlinkdata = await GET_ASYNC(`${data.longUrl}`) //we can write the same as GET_ASYNC(data.longUrl) --> No Difference
        if(cachedlinkdata)
            return res.status(200).send({status:true,message:"Data from Redis ->", data:JSON.parse(cachedlinkdata)})
        /******************************************************************************************/

        let findUrl = await urlModel.findOne({longUrl: data.longUrl},{_id:0, createdAt:0, updatedAt: 0, __v:0})
        if(findUrl){
            await SET_ASYNC(`${data.longUrl}`,JSON.stringify(findUrl));
            return res.status(200).send({status: true, message: "Data from DB ->", data: findUrl})
        }

        let checkShortId = await urlModel.find()
        let id = checkid(checkShortId)

        data.urlCode = id
        data.shortUrl = `http://localhost:3000/${id}`

        let createUrl = await urlModel.create(data)
        let str = JSON.stringify({longUrl:createUrl.longUrl, shortUrl:createUrl.shortUrl, urlCode:createUrl.urlCode})
        await SET_ASYNC(`${data.longUrl}`, str);
        res.status(201).send({status: true, message: 'Data successfully created.', 
        data: {
            longUrl: createUrl.longUrl,
            shortUrl: createUrl.shortUrl,
            urlCode: createUrl.urlCode
        }})

    }catch(err){
        res.status(500).send({status: false, message: err.message})
    }
}

const getUrl = async (req, res) => {
    try{
        let cahcedUrlData = await GET_ASYNC(`${req.params.urlCode}`)
        if(cahcedUrlData)
            // res.status(200).send({status: true, message: "Data from REDIS ->", longUrl: JSON.parse(cahcedUrlData)})
            res.redirect(JSON.parse(cahcedUrlData))
        else{
            let findUrl = await urlModel.findOne({urlCode: req.params.urlCode})
            if(!findUrl)
                return res.status(404).send({status: false, message: 'URL not found.'})
            await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(findUrl.longUrl))
            // res.status(200).send({status: true, message: "Data from DB ->", data: findUrl.longUrl})
            res.redirect(findUrl.longUrl)
        }
    }catch(err){
        res.status(500).send({status: false, message: err.message})
    }
}

const flushRedisCache = (req, res) => {
    redisClient.flushall('ASYNC', (err, data) => {
        if(err)
            console.log(err)
        else if(data) 
            console.log("Memory flushed: ",data)
    })
    res.status(200).send({msg: "Redis memory cleared"})
}

module.exports = {createUrl, getUrl, flushRedisCache}