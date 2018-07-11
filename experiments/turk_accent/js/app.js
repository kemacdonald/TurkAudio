// MODULE FOR INITIAL APP CONFIGURATION
var $ = require('jquery')

var app = {
  config: {n_eval_trials: 10,
    n_training_trials: 0,
  },
  state: {
    n_trials: "",
    training_keys: "",
    eval_keys: "",
    sentence_dict: "",
    key_list: "",
    current_sentence_key: "",
    current_sentence_key_type: ""
  },
  ip: ""
}
// get client's ip information and store in app object
$.getJSON('https://ipapi.co/json/', function(data) {
  app.ip = JSON.stringify(data, null, 2);
});

module.exports = app
