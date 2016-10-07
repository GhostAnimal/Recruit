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
};
