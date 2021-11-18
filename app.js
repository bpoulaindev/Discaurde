const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require("helmet");

const session = require('express-session');
const logger = require('morgan');
const indexRouter = require('./routes/router');
const config = require('./config/config');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: '$3CR37',
  resave: false,
  saveUninitialized: false,
}));
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});
app.use(
  helmet({
    contentSecurityPolicy: 
      config.contentSecurityPolicy
    ,
  })
);
app.use('/', indexRouter);

module.exports = app;
