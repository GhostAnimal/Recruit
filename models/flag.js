var mongoose = require('mongoose')
var flagSchema = require('../schemas/flag')
var Flag = mongoose.model('Flag', flagSchema)

module.exports = Flag