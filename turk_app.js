var express = require('express'),
  path = require('path'),
  helmet = require('helmet'),
  app = express(),
  routes = require('./controllers/routes');

// define port to listen on
var port = 8080;
// keep all security middleware except frameguard
// since we want display on Mturk as iframe
app.use(helmet({frameguard: false}));
app.use('/', routes);
app.use(express.static(path.join(__dirname, 'public')));
app.listen(port);
