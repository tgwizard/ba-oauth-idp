function TokenRepository() {
  var _requestTokens = {};
  var _accessTokens = {};

  this.putRequestToken = function(requestToken) {
    _requestTokens[requestToken.token] = requestToken;
  }

  this.getRequestToken = function(token) {
    return _requestTokens[token];
  }

  this.deleteRequestToken = function(token) {
    delete _requestTokens[token];
  }

  this.putAccessToken = function(accessToken) {
    _accessTokens[accessToken.token] = accessToken;
  }

  this.getAccessToken = function(token) {
    return _accessTokens[token];
  }

  this.deleteAccessToken = function(token) {
    delete _accessTokens[token];
  }
}

module.exports = TokenRepository;
