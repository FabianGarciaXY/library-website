const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog')

// Compression
const compression = require('compression');
app.use(compression()); // Compress all routes

// Database Connection and App set up
const db = require('./database/db')
const app = express();

// view engine setup
app.set('views', [ path.join(__dirname, 'views'),
  path.join(__dirname, '/views/books'),
  path.join(__dirname, 'views/authors'),
  path.join(__dirname, '/views/bookInstances'),
  path.join(__dirname, 'views/genres')]
);

app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Using Routes to middleware chain
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only  providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
