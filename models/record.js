var mongoose = require('mongoose')
var recordSchema = require('../schemas/record')
var Record = mongoose.model('Record', recordSchema)

module.exports = Record