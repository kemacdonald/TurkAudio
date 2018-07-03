// EXPERIMENT SETUP
global.jQuery = require('jquery');

var ajax = require('./ajax'),
  control = require('./control'),
  exp = require('./experiment.js'),
  app = require('./app.js')
  turk = require('./mmturkey.js'),
  $ = require('jquery'),
  DetectRTC = require('detectrtc'),
  _ = require('underscore'),
  jquery_ui = require('jquery-ui');

// wrap the app config code in document.ready
// load the app using a callback so it loads after app is configured
$(document).ready(function(){
  ajax.configure_app(app, function() {
    DetectRTC.load(exp.onRTCready(app, turk));
    control.showSlide("introduction");
  });
});
