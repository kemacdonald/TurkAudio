// Root Turk App
var express = require('express'),
  helmet = require('helmet'),
  turk_accent_routes = require('./routes/turk_accent_routes.js'),
  path = require('path'),app = express()

// define port to listen on
var port = 8080;
// keep all security middleware except frameguard
// since we want display on Mturk as iframe
app.use(helmet({frameguard: false}));

//mount routers for various experiments
app.use('/turk_accent_routes', turk_accent_routes);

// host static materials
app.use(express.static(path.join(__dirname, 'experiments', 'turk_accent')));
app.listen(port);
