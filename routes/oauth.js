var qs = require('querystring'),
    url = require('url'),
    uuid = require('node-uuid'),
    _ = require('underscore'),
    express = require('express');


var _userRepo;
var requestTokens = {};
var accessTokens = {};

function requestToken(req, res, next) {
  parseAuthHeader(req, res, function(oauth_params) {
    var requestToken = {
      token: generateToken(),
      secret: generateToken(),
      callbackUrl: oauth_params.oauth_callback,
    };

    requestTokens[requestToken.token] = requestToken;

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
  var requestToken = requestTokens[token];
  if (!requestToken) return res.send(400, 'invalid token');

  requestToken.verifier = generateToken();

  var callbackUrlObj = url.parse(requestToken.callbackUrl);
  callbackUrlObj.query = callbackUrlObj.query || {};
  callbackUrlObj.query.oauth_token = token;
  callbackUrlObj.query.oauth_verifier = requestToken.verifier;
  var callbackUrl = url.format(callbackUrlObj);

  res.redirect(callbackUrl);
}

function accessToken(req, res, next) {
  parseAuthHeader(req, res, function(oauth_params) {
    var token = oauth_params.oauth_token;
    if (!token) return res.send(400, 'invalid token');
    var requestToken = requestTokens[token];
    if (!requestToken) return res.send(400, 'invalid token');

    delete requestTokens[token];

    var accessToken = {
      token: generateToken(),
      secret: generateToken(),
    };

    accessTokens[accessToken.token] = requestToken;

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

function getUser(req, res, next) {
  _userRepo.getUser('buffy.summers', function(err, userInfo) {
    if (err) {
      console.log(err);
      return res.send(404);
    }

    res.send(200, userInfo);
  });
}

function parseAuthHeader(req, res, cb) {
  // Extract authorization header
  var authHeader = req.header('Authorization') || '';
  if (authHeader.substring(0, 6).toLowerCase() != 'oauth ') return res.send(400, 'invalid authorization header');
  var oauth_params_string = authHeader.substring(6);
  var oauth_params = {};
  _.each(oauth_params_string.split(','), function(p) {
    var ps = p.split('=');
    if (ps.length != 2) return res.send(400, 'invalid authorization header');
    var val = qs.unescape(ps[1].replace(/"/g, ''));
    oauth_params[ps[0]] = val;
  });

  console.log(oauth_params);

  cb(oauth_params);
}

function generateToken() {
  return new Buffer(uuid.v4()).toString('base64');
}

exports.setup = function(app, userRepo) {
  _userRepo = userRepo;
  app.post('/oauth/request_token', requestToken);
  app.get('/oauth/authorize', express.basicAuth(doBasicAuth), authorize);
  app.post('/oauth/access_token', accessToken);
  // TODO: Move & refactor somewhere else
  app.get('/users/me', getUser);
};
