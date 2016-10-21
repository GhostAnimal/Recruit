var mongoose = require('mongoose');
var crypto = require('crypto')

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
    isAdmin: {
        type: Boolean,
        default: false
    },
    name: String,
    phone: String,
    qq: String,
    studentNum: String,
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

userSchema.pre('save',function(next) {

	var user = this ;

	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now();
	}
	else {
		this.meta.updateAt = Date.now();
	}

    // 密码 md5
    var md5 = crypto.createHash('md5');
    user.password = md5.update(user.password).digest('hex');

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

userSchema.methods = {
    comparePassword: function(_password, cb) {
        var md5 = crypto.createHash('md5'),
            password = md5.update(_password).digest('hex');
        if (this.password != password) {
            return cb(false)
        }
        else {
            return cb(true)
        }
    }
}

module.exports = userSchema