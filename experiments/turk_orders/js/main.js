// MAIN JS -- CONFIGURE APP AND START EXPERIMENT
global.jQuery = require('jquery');

var ajax = require('../../../common_js_modules/ajax'),
  control = require('../../../common_js_modules/control'),
  turk = require('../../../common_js_modules/mmturkey.js'),
  exp = require('./experiment.js'),
  app = require('./app.js')
  $ = require('jquery'),
  DetectRTC = require('detectrtc'),
  _ = require('underscore'),
  jquery_ui = require('jquery-ui');

// wrap the app config code in document.ready
// load the app using a callback so it loads after app is configured
$(document).ready(function(){
  ajax.configure_orders_app(app, function() {
    if(_.isEmpty(turk.hitId)) {
      app.state.hit_id = "hitId"
    } else {
      app.state.hit_id  = turk.hitId;
    }
    DetectRTC.load(exp.onRTCready(app, turk));
    control.showSlide("introduction");
  });
});
