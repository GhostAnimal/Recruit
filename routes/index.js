var User = require('../models/User');

var signinRequired = function(req, res, next) {
  var user = req.session.user

  if (!user) {
    return res.redirect('/login')
  }

  next()
}

module.exports = function (app) {
	app.get('/',signinRequired,function(req,res) {
		res.render('index',{})
	});
	app.get('/question/:id',signinRequired,function(req,res) {
		res.render('question',{})
	});
	app.get('/categories/:id',signinRequired,function(req,res) {
		res.render('list',{})
	});
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
					user.save(function(err, user) {
						if (err) {
							console.log(err)
						}

						console.log('注册成功')

						res.redirect('/login')
					})
				}
			})

		}
	});
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
	app.get('/logout',function(req, res) {
		delete req.session.user

		res.redirect('/login')
	});

	app.get('/admin',signinRequired,function(req, res) {
		res.render('admin',{})
	})
};
