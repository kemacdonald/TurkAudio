// Root Turk App
var express = require('express'),
  helmet = require('helmet'),
  turk_accent_routes = require('./routes/turk_accent_routes.js'),
  turk_orders_routes = require('./routes/turk_orders_routes.js'),
  turk_common_routes = require('./routes/turk_common_routes.js'),
  path = require('path'),
  app = express()

// define port to listen on
var port = 8080;
// keep all security middleware except frameguard
// since we want display on Mturk as iframe
app.use(helmet({frameguard: false}));
app.use('/turk_common_routes', turk_common_routes);

// turk accent experiment
// app.use('/turk_accent_routes', turk_accent_routes);
// app.use(express.static(path.join(__dirname, 'experiments', 'turk_accent')));

// turk orders experiment
app.use('/turk_orders_routes', turk_orders_routes);
app.use(express.static(path.join(__dirname, 'experiments', 'turk_orders')));

app.listen(port);
