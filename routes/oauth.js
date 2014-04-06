var qs = require('querystring'),
    url = require('url'),
    _ = require('underscore'),
    express = require('express'),
    oauth = require('../lib/oauth');


var _userRepo,
    _tokenRepo;

function requestToken(req, res, next) {
  oauth.parseAuthHeader(req, res, function(oauth_params) {
    var requestToken = {
      token: oauth.generateToken(),
      secret: oauth.generateToken(),
      callbackUrl: oauth_params.oauth_callback,
    };

    _tokenRepo.putRequestToken(requestToken);

    var entity = {
      oauth_token: requestToken.token,
      oauth_token_secret: requestToken.secret,
      oauth_callback_confirmed: true,
    };
    var entityString = qs.stringify(entity);
    console.log('generated new request token', entityString);

    res.set('Content-Type', 'application/x-www-form-urlencoded');
    res.send(200, entityString);
  });
}

function doBasicAuth(username, password) {
  return _userRepo.authenticate(username, password)
}

function authorize(req, res, next) {
  var token = req.query.oauth_token;
  if (!token) return res.send(400, 'invalid token');
  var requestToken = _tokenRepo.getRequestToken(token);
  if (!requestToken) return res.send(400, 'invalid token');

  console.log('authorized user', req.user);

  requestToken.user = req.user;
  requestToken.verifier = oauth.generateToken();

  _tokenRepo.putRequestToken(requestToken);

  var callbackUrlObj = url.parse(requestToken.callbackUrl);
  callbackUrlObj.query = callbackUrlObj.query || {};
  callbackUrlObj.query.oauth_token = token;
  callbackUrlObj.query.oauth_verifier = requestToken.verifier;
  var callbackUrl = url.format(callbackUrlObj);

  res.redirect(callbackUrl);
}

function accessToken(req, res, next) {
  oauth.parseAuthHeader(req, res, function(oauth_params) {
    var token = oauth_params.oauth_token;
    if (!token) return res.send(400, 'invalid token');
    var requestToken = _tokenRepo.getRequestToken(token);
    if (!requestToken) return res.send(400, 'invalid token');

    _tokenRepo.deleteRequestToken(token);

    var accessToken = {
      token: oauth.generateToken(),
      secret: oauth.generateToken(),
      user: requestToken.user,
    };

    _tokenRepo.putAccessToken(accessToken);

    var entity = {
      oauth_token: accessToken.token,
      oauth_token_secret: accessToken.secret,
    };
    var entityString = qs.stringify(entity);
    console.log('generated new access token', entityString);

    res.set('Content-Type', 'application/x-www-form-urlencoded');
    res.send(200, entityString);
  });
}

exports.setup = function(app, tokenRepo, userRepo) {
  _tokenRepo = tokenRepo;
  _userRepo = userRepo;
  app.post('/oauth/request_token', requestToken);
  app.get('/oauth/authorize', express.basicAuth(doBasicAuth), authorize);
  app.post('/oauth/access_token', accessToken);
};
