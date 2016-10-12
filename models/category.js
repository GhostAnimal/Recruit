var mongoose = require('mongoose')
var categorySchema = require('../schemas/category')
var Category = mongoose.model('category', categorySchema)

module.exports = Category