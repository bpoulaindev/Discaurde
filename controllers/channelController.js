const fs = require('fs');
const path = require('path');
const mongo = require('../manager/mongoManager');

exports.channel = function(req,res) {
  res.redirect('/home');
}
exports.createChannel = function(req,res) {
  const { status } = req.query;
  res.render('index', {
    page: 'partials/home.ejs',
    csrfToken: req.csrfToken(),
    status,
  });
}

exports.removeChannel = function(req,res) {
  res.redirect('/home?status=forbidden');
}

exports.hasAccessChannel = async (req,res) => {
  const { userId, channelId } = req.query;
  if (userId && channelId) {
    res.send(await mongo.hasAccessChannel(userId, channelId))
  }
}

exports.grantAccess = async (req,res) => {
  const { uid, userId, channelId } = req.query;
  if (await mongo.isModerator(uid, channelId)) {
    res.send(await mongo.grantAccess(userId, channelId))
  } else {
    res.send('Access denied.')
  }
}

exports.hasAccessFile = async (req,res) => {
  const { userId, channelId, fileId } = req.query;
  if (userId && channelId && fileId) {
    res.send(await mongo.hasAccessFile(userId, channelId, fileId))
  }
}