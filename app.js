
/**
 * Module dependencies.
 */

var http = require('http');
var path = require('path');
var express = require('express');

var routes = require('./routes');
var oauthRoutes = require('./routes/oauth');
var userRoutes = require('./routes/user');

var oauth = require('./lib/oauth');
var UserRepository = require('./lib/userRepository');
var TokenRepository = require('./lib/tokenRepository');

var userRepo = new UserRepository();
var tokenRepo = new TokenRepository();

oauth.setup(tokenRepo);


var app = express();

// all environments
app.set('port', process.env.PORT || 6622);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



app.get('/', routes.index);
oauthRoutes.setup(app, tokenRepo, userRepo);
userRoutes.setup(app, userRepo);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
