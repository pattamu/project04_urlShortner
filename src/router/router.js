const express = require('express')
const router = express.Router()

const {createUrl, getUrl, flushRedisCache} = require('../controller/urlController')

//api handlers
router.post('/url/shorten', createUrl)
router.get('/:urlCode', getUrl)

//Flush Redis cache
router.delete('/redis/clearcache', flushRedisCache)

module.exports = router