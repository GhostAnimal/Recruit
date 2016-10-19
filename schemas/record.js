var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId

// 答题进度数据模型
var recordSchema = new mongoose.Schema({
    for: {
      type: ObjectId,
      ref: 'User'
    },
    nick: String,
    score: {
      type: Number,
      default: 0
    },
    scoreTemp: {
      type: Number,
      default: 0
    },
    questions: [
        {
            category: {
              type: ObjectId,
              ref: 'Category'
            },
            num: Number,
            question: {
                type: ObjectId,
                ref: 'Question'
            },
            answer: String,
            score: {
                type: Number,
                default: 0
            },
            comment: {
                type: String,
                default: ''
            },
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

recordSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }
  for (var i = this.questions.length - 1; i >= 0; i--) {
    this.score += this.questions[i]
  }
  this
    .find({})
    .sort('score')
    .exec(function (err, _records) {
      for (var i = 0; i < _records.length; i++) {
        _records[i].rank = i + 1
      }
    })

  next() 
})

recordSchema.statics =  {
    fetch: function(cb) {
        return this
          .find({})
          .sort('score')
          .exec(cb)
    },
    findById: function(id, cb) {
        return this
          .findOne({_id: id})
          .exec(cb)
    }
}

module.exports = recordSchema