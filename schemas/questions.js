var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.Types.ObjectId

// 问题数据模型
var questionSchema = new mongoose.Schema({
    category: {
        type: ObjectId,
        ref: 'Category'
    },
    deadline: String,
    description: String,
    tips: Array,
    flag: String,
    file: String,
    name: String,
    num: Number,
    needFile: Boolean,
    score: Number,
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

questionSchema.pre('save', function(next) {
   if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }
  // this
  //   .find({})
  //   .sort('meta.createAt')
  //   .exec(function (err, questions) {
  //     for (var i = 0; i < questions.length; i++) {
  //       questions[i].num = i+1
  //     }
  //   })
  next() 
})

questionSchema.statics =  {
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

module.exports = questionSchema