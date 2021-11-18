const fs = require('fs');
const path = require('path');
//contient les requêtes mongoDB
const mongo = require('../manager/mongoManager');

exports.index = function(req,res) {
  res.redirect('/home');
}
exports.home = function(req,res) {
  const { status } = req.query;
  res.render('index', {
    page: 'partials/home.ejs',
    csrfToken: req.csrfToken(),
    status,
  });
}
exports.forbidden = function(req,res) {
  res.redirect('/home?status=forbidden');
}
