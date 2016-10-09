var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId

// 答题进度数据模型
var recordsSchema = new mongoose.Schema({
    questions: [
        {
            question: {
                type: ObjectId,
                ref: 'Question'
            },
            score: Number,
            comment: String,
            tried: {
                type: Number,
                default: 0
            }
        }
    ],
    rank: Number,
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

recordsSchema.pre('save', function(next) {
   if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  next() 
})

recordsSchema.statics =  {
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

module.exports = recordsSchema