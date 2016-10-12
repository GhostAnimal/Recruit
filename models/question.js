var mongoose = require('mongoose')
var questionSchema = require('../schemas/questions')
var Question = mongoose.model('questions', questionSchema)

module.exports = Question