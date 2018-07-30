var express = require('express'),
  fs = require('fs'),
  path = require('path'),
  mkdirp = require('mkdirp'),
  url = require('url'),
  util = require('util'),
  bodyParser = require('body-parser'),
  _ = require('underscore'),
  formidable = require('formidable'),
  path = require('path'),
  util = require('util'),
  router = express.Router(),
  jsonParser = bodyParser.json()

router.get('/configure_orders_app', jsonParser, function(req, res) {
  var app = req.query;
  // get list number from list of available order numbers
  var order_number_dict_path = path.join('experiments', 'turk_orders', 'data_model', 'order_list_dict.json');
  var order_number_dict = JSON.parse(fs.readFileSync(order_number_dict_path, 'utf8'));
  if(!_.isEmpty(order_number_dict["list_number_generator"])) {
    console.log('sampling list number from list generator dict');
    var list_number = _.sample(order_number_dict['list_number_generator'], 1).toString();
  } else {
    console.log('sampling list number randomly');
    var list_number = _.random(app.config.n_orders_list_min, app.config.n_orders_list_max).toString();
  }
  // use list number to load the corresponding order instructions
  var orders_dict_path = path.join('experiments', 'turk_orders', 'data_model', "instructions.json")
  var orders_dict = JSON.parse(fs.readFileSync(orders_dict_path, 'utf8'));

  var list_of_order_keys_path = path.join('experiments', 'turk_orders', 'data_model', "turker_assignments.json")
  var list_of_order_keys = JSON.parse(fs.readFileSync(list_of_order_keys_path, 'utf8'));
  // construct app.state
  app.state.list_number = list_number;
  app.state.person_key = "person" + list_number;
  app.state.key_list = list_of_order_keys[app.state.person_key]
  app.state.n_trials = _.size(app.state.key_list)
  // build order instructions dict for this turker
  var curr_order_dict = {}
  _.each(app.state.key_list, function(key) {
        curr_order_dict[key] = {'instructions': orders_dict[key]}
  });
  app.state.sentence_dict = curr_order_dict;

  // return configured app
  res.json(app.state);
})

router.post('/remove_list_number', jsonParser, function (req, res) {
  console.log('removing list key from orders dictionary')
  if (!req.body) return res.sendStatus(400)
  var list_number = req.body['list_number'];
  var order_list_generator_path = path.join('experiments', 'turk_orders', 'data_model', 'order_list_dict.json');
  var old_order_dict = JSON.parse(fs.readFileSync(order_list_generator_path, 'utf8'));
  var new_order_array = _.filter(old_order_dict["list_number_generator"], function(num){ return num != list_number; })
  old_order_dict["list_number_generator"] = new_order_array;
  var new_json =  JSON.stringify(old_order_dict);
  // rewrite order object to disk removing the current participants list number from the pool
  fs.writeFile(order_list_generator_path, new_json, 'utf8', function (err) {
       if (err) {return console.log(err);} console.log("The updated order generator was saved");
   });
});

// //handle post request when user finishes the task
router.post('/submit', jsonParser, function (req, res) {
  console.log('submit post received');
  if (!req.body) return res.sendStatus(400);
  var list_number = req.body['list_number'];
  var order_list_generator_path = path.join('experiments', 'turk_orders', 'data_model');
  var order_dict = JSON.parse(fs.readFileSync(path.join(order_list_generator_path, 'order_list_dict.json'), 'utf8'));
  order_dict["list_number_finisher"].push(list_number);
  console.log(order_dict);
  var new_json =  JSON.stringify(order_dict);
  // rewrite order object to disk removing the current participants list number from the pool
  fs.writeFile(order_list_generator_path, new_json, 'utf8', function (err) {
       if (err) {return console.log(err);} console.log("The updated order lists file was saved!");
   });
});

//export this router to use in our main turk_app.js
module.exports = router;
