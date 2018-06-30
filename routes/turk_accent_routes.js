var express = require('express'),
  fs = require('fs'),
  path = require('path'),
  mkdirp = require('mkdirp'),
  url = require('url'),
  util = require('util'),
  bodyParser = require('body-parser'),
  _ = require('underscore'),
  uploads = require('../custom_modules/uploads'),
  router = express.Router()

var jsonParser = bodyParser.json()

// handle routing requests
router.use(function (req, res, next) {
  console.log('Time:', Date.now())
  next()
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
  uploads.uploadFile(req, res);
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
