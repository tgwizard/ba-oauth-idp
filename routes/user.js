var express = require('express'),
    oauth = require('../lib/oauth');

var _userRepo;

function getUser(req, res, next) {
  _userRepo.getUser(req.user, function(err, userInfo) {
    if (err) {
      console.log(err);
      return res.send(404);
    }

    res.send(200, userInfo);
  });
}

exports.setup = function(app, userRepo) {
  _userRepo = userRepo;
  app.get('/users/me', oauth.requireAccessToken, getUser);
};
