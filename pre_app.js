/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const express = require('express');
const path = require('path');
const expressStatusMonitor = require('express-status-monitor');
const compression = require('compression');
const sass = require('node-sass-middleware');
const logger = require('morgan');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const errorHandler = require('errorhandler');
const chalk = require('chalk');

/**
 * Create Express server.
 */
var app = express();
/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
/**
 * Primary app routes.
 */
app.get('/', homeController.pre_index);


/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), function(){
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); 
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
