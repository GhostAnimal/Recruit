var mongoose = require('mongoose')
var questionSchema = require('../schemas/questions')
var Question = mongoose.model('Question', questionSchema)

module.exports = Question