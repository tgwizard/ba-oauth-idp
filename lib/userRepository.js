var userCreds = {
  'buffy.summers': {
    password: 'slayer',
  }
};

var userInfos = {
  'buffy.summers': {
    sub: 'buffy.summers',
    name: 'Buffy Summers',
    email: 'buffy.summers@example.com',
  }
};

function UserRepository() {
  this.getUser = function(username, cb) {
    var userInfo = userInfos[username];
    if (!userInfo) return cb(new Error("user not found"));

    cb(null, userInfo);
  };

  this.authenticate = function(username, password) {
    var user = userCreds[username];
    if (!user) return false;
    if (!user.password === password) return false;
    return true;
  };
}

module.exports = UserRepository;
