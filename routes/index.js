
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'basic auth oauth identity provider' });
};
