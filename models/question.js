var mongoose = require('mongoose')
var questionSchema = require('../schemas/questions')
var Question = mongoose.model('Movie', questionSchema)

module.exports = Question