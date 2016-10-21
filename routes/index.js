var fs = require('fs')
var path = require('path')
var multipart = require('connect-multiparty')
var _ = require('underscore')

var mongoose = require('mongoose')
var User = require('../models/User')
var Category = require('../models/Category')
var Question = require('../models/Question')
var Record = require('../models/Record')

var multipartMiddleware = multipart() 

var record = {}

// 登录验证
var signinRequired = function(req, res, next) {
  var user = req.session.user

  if (!user) {
  	console.log('未登录')
    return res.redirect('/login')
  }
  else {
  	Record.findOne({for: user._id}, function(err, _record) {
  		record = _record
  	})
  }

  next()
}

// 保存文件
var saveFile = function (req, res, next) {
	if (req.files.uploadPoster) {
		if (req.files.uploadPoster.originalFilename!='') {
			var postData = req.files.uploadPoster
			var filePath = postData.path
			var originalFilename = postData.originalFilename

			fs.readFile(filePath, function(err, data) {
				var timestamp = Date.now()
				var _type = postData.name.split('.')
				    type = _type[_type.length-1]
				var file = timestamp + '.' + type
				var newPath = path.join(__dirname, '../', '/public/upload/' + file)

				fs.writeFile(newPath, data, function(err) {
					req.file = file
					next()
				})
			})
		}
		else {
			next()
		}
	}
	else {
		next()
	}
}

// 获取种类
var categories = [];

Category
	.find({})
	.sort('meta.creatAt')
	.exec(function(err, _categories) {
		if (err) {
			console.log(err)
		}
		categories = _categories
	})

// 排序函数
function keySort(key) {
	return function (ob1, ob2) {
		if (ob2[key] > ob1[key]) {
			return 1
		}
		else if (ob2[key] < ob1[key]) {
			return -1
		}
		else {
			return 0
		}
	}
}	


module.exports = function (app) {
	app.use(function(req, res, next) {
	    var _user = req.session.user
	    app.locals.user=_user
	    // 获取当前用户排名
	    if (_user) {
		    Record.find({}, function(err, _records) {
		    	_records = _records.sort(keySort('score'))
				for (var i = 0; i < _records.length; i++) {
			        _records[i].rank = i + 1
			        _records[i].save(function(err, _r) {
			        	if (err) {
			        		console.log(err)
			        	}
			        })
			      }
			})
			Record.find({for: _user._id}, function(err, _record) {
				if (err) {
					console.log(err)
				}
				record = _record
			})
	    }
	    next()
	})


	// 首页
	app.get("/",signinRequired,function(req, res) {
		Record.find({}, function (err, _records) {
			records = _records.sort(keySort('score'))
			for (var i = _records.length - 1; i >= 0; i--) {
				_records[i].scoreTemp = _records[i].score
			}
			res.render('index',{
				categories: categories,
				record: record,
				records: _records,
				page: ''
			})
		})
	})
	app.get('/record/:id',signinRequired,function(req,res) {
		var category = req.params.id
		Record.find({}, function(err, _records) {
			for (var i = _records.length - 1; i >= 0; i--) {
				_records[i].scoreTemp = 0
				for (var j = _records[i].questions.length - 1; j >= 0; j--) {
					if (_records[i].questions[j].category == category) {
						_records[i].scoreTemp += _records[i].questions[j].score
					}

				}
				records = _records.sort(keySort('scoreTemp'))
			}
			res.render('index',{
				categories: categories,
				record: record,
				records: records,
				page: category
			})
		})
	});

	// 问题详情页
	app.get('/question/:id',signinRequired,function(req,res) {
		var id = req.params.id

		Question.findById(id, function (err, question) {
			Record.findOne({for: req.session.user._id} ,function(err, record) {
				var theRecord = {}
				for (var i = record.questions.length - 1; i >= 0; i--) {
					if (record.questions[i].question == id) {
						theRecord = record.questions[i]
						console.log(theRecord)
						break
					}
				}
				res.render('question',{
					record: record,
					categories: categories,
					question: question,
					theRecord: theRecord
				})
			})
		})
	});

	// 答题接口
	app.post('/answer',multipartMiddleware,signinRequired,saveFile,function(req,res) {
		if (req.file) {
	    	req.body.answer = req.file
	    	Record.findOne({for: req.session.user._id},function(err, record) {
	    		if (err) {
	    			console.log(err)
	    		}
	    		var _question = {
	    			num: req.body.num,
					question: req.body.id,
					category: req.body.category,
					answer: req.body.answer,
				}

				var isFirst=true;

				for (var i = record.questions.length - 1; i >= 0; i--) {
					if (record.questions[i].question == req.body.id) {
						record.questions[i] = _.extend(record.questions[i], _question);
						isFirst = false
						console.log(record.questions[i])
					}
				}

				if (isFirst) {
					record.questions.push(_question)
				}

				record.save(function(err, record) {
					if (err) {
						console.log(err)
					}
					console.log('回答成功')
					res.redirect('/question/'+req.body.id)
				})
	    	})
	    }
	    else {
	    	Record.findOne({for: req.session.user._id}, function(err, record) {
	    		if (err) {
	    			console.log(err)
	    		}
	    		Question.findById(req.body.id, function(err, question) {
					var _question = {
						num: req.body.num,
						question: req.body.id,
						category: req.body.category,
						answer: req.body.answer,
						score: 0
					}

	    			if (req.body.answer === question.flag) {
	    				_question.score = question.score
	    			}
	    			console.log(_question)
	    			var isFirst=true;

					for (var i = record.questions.length - 1; i >= 0; i--) {
						if (record.questions[i].question == req.body.id) {
							record.questions[i] = _.extend(record.questions[i], _question);
							isFirst = false
							console.log(record.questions[i])
						}
					}

					if (isFirst) {
						record.questions.push(_question)
					}

					record.save(function(err, record) {
						if (err) {
							console.log(err)
						}
						console.log('回答成功')
						res.redirect('/question/'+req.body.id)
					})
	    		})
	    		
	    	})
	    }	
	})

	// 问题列表页
	app.get('/categories/:id',signinRequired,function(req,res) {
		Category
			.find({_id: req.params.id})
			.populate({
				path: 'questions',
			})
			.exec(function(err, _categories) {
				if (err) {
					console.log(err)
				}
				var category = _categories[0] || {}
				var questions = category.questions || []

				res.render('list',{
					record: record,
					categories: categories,
					category: category,
					questions: questions
				})
			})
	});

	// 注册页
	app.get('/register',function(req,res) {
		res.render('register',{err: ''})
	});
	app.post('/register',function(req,res) {
		var _user = req.body.user,
		    password_re = req.body['password-repeat'];
		if (_user.password===password_re) {
			User.findOne({email:_user.email},function(err ,user) {
				if (err) {
					console.log(err)
				}
				if (user) {
					console.log('该email已被注册');
					res.render('register',{err: '该email已被注册,请重新填写'})
				}
				else {
					var user = new User(_user)

					var _record = {
					    for: user._id,
					    nick: user.nick,	
					    questions: [],
					    rank: 0
					}
					var record = new Record(_record)

					user.save(function(err, user) {
						if (err) {
							console.log(err)
						}
						record.save(function(err, record) {
							if (err) {
								console.log(err)
							}
							console.log('注册成功')
							res.redirect('/login')
						})
					})
				}
			})

		}
	});

	// 登录页
	app.get('/login',function(req,res) {
		res.render('login',{err: ''})
	});
	app.post('/login',function(req, res) {
		var _user = req.body.user;
		var password = _user.password
     	var email= _user.email

		User.findOne({email: _user.email}, function(err ,user) {
			if (err) {
				console.log(err)
			}
			if (!user) {
				console.log('用户不存在')
				return res.render('login',{err: '用户不存在'})
			}
			else {
				user.comparePassword(password, function(isMatch) {
					if (isMatch) {
						req.session.user = user
						return res.redirect('/')
					}
					else {
						console.log('密码错误');
 						return res.render('login',{err: '密码错误'})
					}
				})
			}
		})
	});

	// 登出
	app.get('/logout',function(req, res) {
		delete req.session.user

		res.redirect('/login')
	});

	// 管理员首页
	app.get('/admin',signinRequired,function(req, res) {
		res.render('admin',{
			categories: categories,
		})
	});

	// 种类管理
	app.get('/admin/category/:id',signinRequired,function(req, res) {
		Category
			.find({_id: req.params.id})
			.populate({
				path: 'questions',
			})
			.exec(function(err, _categories) {
				if (err) {
					console.log(err)
				}
				var category = _categories[0] || {}
				var questions = category.questions || []

				res.render('adminCat',{
					record: record,
					categories: categories,
					category: category,
					questions: questions
				})
			})
	})

	// 添加问题种类接口
	app.post('/newCategory',signinRequired,function(req, res) {
		var _category = req.body.category
	    var category = new Category(_category)

	    category.save(function(err, category) {
	      if (err) {
	        console.log(err)
	      }
	      console.log('添加成功')
	      res.redirect('/admin')
		})
	});	

	// 删除种类
	app.delete('/removeCat',signinRequired,function(req, res) {
		var id = req.query.id
		if (id) {
			Category.remove({_id: id}, function(err, category) {
				if (err) {
					console.log(err)
					res.json({success: 0})
				}
				else {
					Question.remove({category: id}, function(_err, questions) {
						if (_err) {
							console.log(err)
							res.json({success: 0})
						}
						else {
							res.json({success: 1})
						}
					})
				}
			})
		}
	})

	// 添加问题页
	app.get('/addQuestion',signinRequired,function(req, res) {
		res.render('addQuestion',{
			categories: categories,
		})
	})

	// 添加问题接口
	app.post('/addQuestion/add',multipartMiddleware,signinRequired,saveFile,function(req, res) {
		var id = req.body.question._id
	    var questionObj = req.body.question
	    questionObj.tips = questionObj.tips.split(',')
	    console.log(questionObj)
	    var _question

	    if (req.file) {
	    	questionObj.file = req.file
	    }

	    if (id) {
		    Question.findById(id, function(err, question) {
		      if (err) {
		        console.log(err)
		      }

		      _question = _.extend(question, questionObj)
		      _question.save(function(err, question) {
		        if (err) {
		          console.log(err)
		        }

		        res.redirect('/question/' + question._id)
		      })
		    })
		  }
		  else {
		    _question = new Question(questionObj)

		    var categoryId = questionObj.category

		    _question.save(function(err, question) {
		      if (err) {
		        console.log(err)
		      }
		      if (categoryId) {
		        Category.findById(categoryId, function(err, category) {
		          category.questions.push(question._id)

		          category.save(function(err, category) {
			        Question
			          	.find({})
			          	.sort('meta.createAt')
			          	.exec(function(err, questions) {
			          	  for (var i = 0; i < questions.length; i++) {
					        questions[i].num = i+1
					        questions[i].save(function(err, q) {
					        	if (err) {
					        		console.log(err)
					        	}
					        })
					      }
					      
			          	})
		          	console.log('添加成功')
		            res.redirect('/admin')
		          })
		        })
		      }

		    })
		  }
	})

	// 删除问题
	app.delete('/removeQuestion',signinRequired,function(req, res) {
		var id = req.query.id
		if (id) {
			Question.remove({_id: id}, function(err, question){
				if (err) {
					console.log(err)
					res.json({success: 0})
				}
				else {
					res.json({success: 1})
				}
			})
		}
	})

	// 批改页
	app.get('/comment/:id',signinRequired,function(req, res) {
		var id = req.params.id
		var name = ''
		var max = 0
		var question = ''
		Question.findById(id, function(err, _question) {
			if (err) {
				console.log(err)
			}
			name = _question.name
			max = _question.score
			question = _question._id
		})

		var theRecords = []
		Record
			.find({})
			.sort('meta.updateAt')
			.exec(function (err, _records) {
				for (var i = 0; i < _records.length; i++) {
					for (var j = 0; j < _records[i].questions.length; j++) {
						if (_records[i].questions[j].question == id) {
							theRecords.push({
								for: _records[i].for,
								nick: _records[i].nick,
								answer: _records[i].questions[j].answer
							})
						}
					}
				}
				res.render('adminRecords', {
					name: name,
					max: max,
					question: question,
					categories: categories,
					theRecords: theRecords
				})
			})
	})

	// 批改接口
	app.post('/toComment/:id',signinRequired,function(req, res) {
		var id = req.params.id
		var question = req.body.question
		var score = req.body.score
		var comment = req.body.comment
		var newRecord = {
			score: score,
			comment: comment
		}
		Record.findOne({for: id}, function(err, _record) {
			if (err) {
				console.log(err)
			}
			for (var i = _record.questions.length - 1; i >= 0; i--) {
				if (_record.questions[i].question == question) {
					_record.questions[i] = _.extend(_record.questions[i], newRecord);
				}
			}
			_record.save(function(err, record) {
				if (err) {
					console.log(err)
				}
				console.log('批改成功')
				res.redirect('/comment/' + question)
			})
		})
	})


};
