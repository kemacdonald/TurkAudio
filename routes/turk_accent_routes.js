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
  if (parseInt(app.config.n_training_trials) == 0) {
    app.state.key_list = app.state.eval_keys;
  } else {
    app.state.key_list = app.state.training_keys + "," + app.state.eval_keys;
    app.state.key_list = app.state.key_list.split(",")
  }
  app.state.key_list = _.shuffle(app.state.key_list)
  // build sentence dictionary
  var curr_sentence_dict = {}
  _.each(app.state.key_list, function(key) {
        curr_sentence_dict[key] = {'sentence': full_sentence_dict[key]['sentence'],
                                  'sentence_type': full_sentence_dict[key]['sentence_type']}
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

function isDirSync(aPath) {
  try {
    return fs.statSync(aPath).isDirectory();
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
}

// handle post request when user uploads audio files
router.post('/endpoint', function(req, res){
  var form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.maxFieldsSize = 10 * 1024 * 1024;
  form.maxFields = 1000;
  form.multiples = false;

  form.on('fileBegin', function(field, file) {
    console.log('------------------------------');
    console.log('the file name sent from the user is: ', file.name)
    var file_name_split = file.name.split('-'),
      hit_id = file_name_split[0],
      sentence_key = file_name_split[1],
      worker_id = file_name_split[2].replace('.webm', ''),
      person_dir = 'turker_' + worker_id + '/',
      file_name = sentence_key + "_" + worker_id + '.webm',
      upload_dir_path = path.join('uploads', hit_id, person_dir);
    // check if upload directory exists, and if not create it
    console.log('the directory ' + upload_dir_path + ' exists:', isDirSync(upload_dir_path));
    if (!isDirSync(upload_dir_path)) {
      console.log(upload_dir_path + ' did not exist, creating now')
      fs.mkdirSync(upload_dir_path);
    }
    // log pieces of upload path to see where things go wrong
    console.log('the sentence_key is: ', sentence_key);
    console.log('the hit_id is: ', hit_id)
    console.log('the worker_id is: ', worker_id)
    console.log('the file_name for the audio upload path is: ', file_name)
    console.log('the person_dir is: ', person_dir)
    // set the upload path for the file
    file.path = path.join('uploads', hit_id, person_dir, file_name)
    console.log('the final upload path is: ', file.path)
  });

  form.on('error', function(err) {console.log('An error has occured: \n' + err);});
  form.parse(req)
  form.on('end', function(){res.end('successfully uploaded audio file');})
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
