var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId
var _ = require('underscore')

// 问题种类数据模型
var categorySchema = new mongoose.Schema({
    name: String,
    questions: [{type: ObjectId, ref: 'Question'}],
    meta: {
    	createAt:{
    		type: Date,
    		default: Date.now()
    	},
    	updateAt:{
    		type: Date,
    		default: Date.now()
    	}
    }
})

categorySchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }
  this.name = this.name.replace(/\汤包/g, "大帅比")
  next()
})

categorySchema.statics = {
  fetch: function(cb) {
    return this
      .find({})
      .sort('meta.updateAt')
      .exec(cb)
  },
  findById: function(id, cb) {
    return this
      .findOne({_id: id})
      .exec(cb)
  }
}

module.exports = categorySchema