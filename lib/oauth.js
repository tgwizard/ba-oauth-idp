var qs = require('querystring'),
    url = require('url'),
    uuid = require('node-uuid'),
    _ = require('underscore');

var _tokenRepo;

function parseAuthHeader(req, res, cb) {
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

function requireAccessToken(req, res, next) {
  parseAuthHeader(req, res, function(oauth_params) {
    var token = oauth_params.oauth_token;
    if (!token) return res.send(401, 'invalid token');
    var accessToken = _tokenRepo.getAccessToken(token);
    if (!accessToken) return res.send(401, 'invalid token');

    req.user = accessToken.user;
    next();
  })
}

exports.setup = function(tokenRepo) {
  _tokenRepo = tokenRepo;
};

exports.generateToken = generateToken;
exports.parseAuthHeader = parseAuthHeader;
exports.requireAccessToken = requireAccessToken;
