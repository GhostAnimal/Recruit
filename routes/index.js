module.exports = function (app) {
	app.get('/',function(req,res) {
		res.render('index',{})
	});
	app.get('/question/:id',function(req,res) {
		res.render('question',{})
	});
	app.get('/categories/:id',function(req,res) {
		res.render('list',{})
	});
	app.get('/register',function(req,res) {
		res.render('register',{})
	});
	app.get('/login',function(req,res) {
		res.render('login',{})
	})
};
