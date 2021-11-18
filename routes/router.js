const express = require('express');

const router = express.Router();

const indexController = require('../controllers/indexController');
const userController = require('../controllers/userController');
const uploadController = require('../controllers/uploadController');
const channelController = require('../controllers/channelController');

const csrf = require('csurf')
const csrfProtection = csrf({ cookie: true })

function requireLogin(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/denied')
  }
}

function isAdmin(req, res, next) {
  if (req.session.user.role === 'admin') {
    next();
  } else {
    res.redirect('/denied')
  }
}

function isManager(req, res, next) {
  if (req.session.user.role === 'manager') {
    next()
  } else {
    res.redirect('/denied')
  }
}

router.get('/', indexController.index);
router.get('/home', csrfProtection, indexController.home);
router.get('/register', csrfProtection, userController.register);

router.get('/profile', requireLogin, csrfProtection, userController.profile);

router.post('/upload', requireLogin, uploadController.upload);
router.post('/profile/delete/:fileName', requireLogin, uploadController.delete);
router.post('/profile/deleteAccount', requireLogin, userController.deleteAccount);

router.post('/register', csrfProtection, userController.signup);
router.post('/login', csrfProtection, userController.login);
router.post('/logout', csrfProtection, userController.logout);

router.post("/auth/requestResetPassword", userController.resetPasswordRequestController);
router.post("/auth/resetPassword", userController.resetPasswordController);
router.get('/passwordReset', csrfProtection, userController.resetLogin);

router.post('/channel/hasAccessChannel', channelController.hasAccessChannel);
router.post('/channel/grantAccess', channelController.grantAccess);
router.post('/channel/hasAccessFile', channelController.hasAccessFile)



router.get('/*', csrfProtection, indexController.forbidden); // redirect error url

module.exports = router;
