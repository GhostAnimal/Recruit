var mongoose = require('mongoose');
var bcrypt = require('bcryptjs')

// 用户数据模型
var userSchema = new mongoose.Schema({
    email: {
    	unique: true,
    	type: String
    },
    password: String,
    nick: String,
    description: String,
    id: Number,
    idCards: String,
    isAdmin: Boolean,
    name: String,
    phone: String,
    qq: String,
    studentNum: String,
    meta: {
    	createAt{
    		type: Date,
    		default: Date.now()
    	},
    	updateAt{
    		type: Date,
    		default: Date.now()
    	}
    }
})

userSchema.pre('save',function(next) {

	var user = this ;

	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now();
	}
	else {
		this.meta.updateAt = Date.now();
	}

	// 密码hash
	bcrypt.genSalt(10, function(err, salt) {
		if (err) {
			return next(err)
		}
		bcrypt.hash(user.password, salt, function(err, hash) {
			if (err) {
				return next(err)
			}

			user.password = hash

			next()
		})
	})

	next()
})

userSchema.statics = {
	fetch: function(cb) {
		return this
				   .find({})
				   .sort()
				   .exec(cb)
	},
	findById: function(id,cb) {
		return this
				   .findOne({_id: id})
				   .exec(cb)
	},
}

module.exports = userSchema