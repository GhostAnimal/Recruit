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

var saveFile = function (req, res, next) {
	if (req.files.uploadPoster) {
		var postData = req.files.uploadPoster
		var filePath = postData.path
		var originalFilename = postData.originalFilename

		if (originalFilename) {
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
	}
	else {
		next()
	}
}


var categories = [];

Category.fetch(function(err, _categories) {
	    if (err) {
	      console.log(err)
	    }
		categories = _categories
  	})

var records = [];

var getRank = function (category) {
	Record.find({}, function (err, _records) {
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
		if (!category) {
			records = _records.sort(getRank('score'))
			for (var i = _records.length - 1; i >= 0; i--) {
				_records[i].scoreTemp = _records[i].score
			}
		}
		else{
			for (var i = _records.length - 1; i >= 0; i--) {

				for (var j = _records[i].questions.length - 1; j >= 0; j--) {

					if (_records[i].questions[j].category == category) {
						_records[i].scoreTemp += _records[i].questions[j].score
					}

				}
				records = _records.sort(getRank('scoreTemp'))
			}
		}
	})
}


module.exports = function (app) {
	app.use(function(req, res, next) {
	    var _user = req.session.user
	    app.locals.user=_user
	    next()
	})


	// 首页
	app.get("/",signinRequired,function(req, res) {
		getRank()

		res.render('index',{
			categories: categories,
			record: record,
			records: records
		})
	})
	app.get('/record/:id',signinRequired,function(req,res) {
		var category = req.params.id

		getRank(category)

		res.render('index',{
			categories: categories,
			record: record,
			records: records
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
					console.log(User.fetch());
					res.render('register',{err: '该email已被注册,请重新填写'})
				}
				else {
					var user = new User(_user)

					var _record = {
					    for: user._id,
					    nick: user.nick,	
					    questions: [],
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
		console.log(password)
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
		          	console.log('添加成功')
		            res.redirect('/admin')
		          })
		        })
		      }

		    })
		  }
	})



};
