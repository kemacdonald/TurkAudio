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
  router = express.Router()

var jsonParser = bodyParser.json()

router.get('/sentence_dict', jsonParser, function(req, res) {
  var app = req.query;
  // get sentence dict
  var sentence_dict_path = path.join('experiments', 'turk_accent', 'data_model', 'common_voices.json');
  var full_sentence_dict = JSON.parse(fs.readFileSync(sentence_dict_path, 'utf8'));
  // read in training and eval keys
  var eval_keys_path = path.join('experiments', 'turk_accent', 'data_model', 'eval_keys.json');
  var training_keys_path = path.join('experiments', 'turk_accent', 'data_model', 'training_keys.json');
  var eval_keys = JSON.parse(fs.readFileSync(eval_keys_path, 'utf8'));
  var eval_keys_sample = _.sample(eval_keys, app.config.n_eval_trials);
  var training_keys = JSON.parse(fs.readFileSync(training_keys_path, 'utf8'));
  var training_keys_sample = _.sample(training_keys, app.config.n_training_trials);
  // add to app
  app.state.training_keys = training_keys_sample;
  app.state.eval_keys = eval_keys_sample;
  app.state.n_trials = parseInt(app.config.n_eval_trials) + parseInt(app.config.n_training_trials);
  // build key list
  app.state.key_list = app.state.training_keys + "," + app.state.eval_keys;
  app.state.key_list = app.state.key_list.split(",")
  _.shuffle(app.state.key_list)
  // build sentence dictionary
  var curr_sentence_dict = {}
  var key_length = 6
  _.each(app.state.key_list, function(key) {
      if (key.toString().length == key_length) {
        curr_sentence_dict[key] = {'sentence': full_sentence_dict[key]['sentence'],
                                  'sentence_type': full_sentence_dict[key]['sentence_type']}
      };
  });
  app.state.sentence_dict = curr_sentence_dict;
  res.json(app.state);
})

router.post('/make_dir', jsonParser, function(req, res) {
  var dir_path = path.join('uploads', req.body['dir_name']);
  mkdirp(dir_path, function(err) {
    if (err) console.error(err)
      else console.log('created upload directory at: ' + dir_path)
  });
})

router.post('/remove_list_number', jsonParser, function (req, res) {
  console.log('removing list number from orders dict')
  if (!req.body) return res.sendStatus(400)
  var list_number = req.body['list_number'];
  var order_list_generator_path = path.join('experiments', 'turk_accent', 'order_list_generator.json');
  var old_order_dict = JSON.parse(fs.readFileSync(order_list_generator_path, 'utf8'));
  var new_order_array = _.filter(old_order_dict["list_number_generator"], function(num){ return num != list_number; })
  old_order_dict["list_number_generator"] = new_order_array;
  var new_json =  JSON.stringify(old_order_dict);
  // rewrite order object to disk removing the current participants list number from the pool
  fs.writeFile(order_list_generator_path, new_json, 'utf8', function (err) {
       if (err) {return console.log(err);} console.log("The updated order generator was saved");
   });
});

// handle post request when user uploads audio files
router.post('/endpoint', function(req, res){
  var form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.maxFieldsSize = 10 * 1024 * 1024;
  form.maxFields = 1000;
  form.multiples = false;
  // parse data
  form.parse(req);
  // save to server
  form.on('fileBegin', function(name, file) {
    var person_dir = 'turker_' + file.name.split('_')[1].replace('.webm', '') + "/"
    file.path = './uploads/' + person_dir + file.name;
    res.end();
  });
})

// //handle post request when user finishes the task
router.post('/submit', jsonParser, function (req, res) {
  console.log('submit post received');
  if (!req.body) return res.sendStatus(400);
  var list_number = req.body['list_number'];
  var order_dict = JSON.parse(fs.readFileSync('public/order_list_generator.json', 'utf8'));
  order_dict["list_number_finisher"].push(list_number);
  console.log(order_dict);
  var new_json =  JSON.stringify(order_dict);
  // rewrite order object to disk removing the current participants list number from the pool
  fs.writeFile("public/order_list_generator.json", new_json, 'utf8', function (err) {
       if (err) {return console.log(err);} console.log("The updated order lists file was saved!");
   });
});

//export this router to use in our index.js
module.exports = router;
