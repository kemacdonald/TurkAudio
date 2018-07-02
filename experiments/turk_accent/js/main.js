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

// Key functionality is two AJAX calls that are initiated by generate_list_of_orders()
// The first generates an order number based on a json dict of possible order_lists
// The second call grabs the ordering instructions json list to display it to the turker

// wrap the init code in document.ready
// so that the ajax call only fires once when the page loads
$(document).ready(function(){
  ajax.generate_sentence_list(app);
  DetectRTC.load(exp.onRTCready(app, turk));
  control.showSlide("introduction");
});
