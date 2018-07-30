// MODULE FOR INITIAL APP CONFIGURATION
var $ = require('jquery')

var app = {
  config: {
    experiment_type: "orders",
    n_orders_in_list: 50,
    n_orders_list_min: 20,
    n_orders_list_max: 80
  },
  state: {
    hit_id: "",
    order_number: "",
    person_key: "",
    list_number: "",
    n_trials: "",
    key_list: "",
    sentence_dict: "",
    current_sentence_key: "",
  },
  ip: ""
}
// get client's ip information and store in app object
$.getJSON('https://ipapi.co/json/', function(data) {
  app.ip = JSON.stringify(data, null, 2);
});

module.exports = app
