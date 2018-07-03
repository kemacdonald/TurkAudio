#!/usr/bin/env node

/* turk_app.js  */

var express = require('express'),
  fs = require('fs'),
  path = require('path'),
  mkdirp = require('mkdirp'),
  url = require('url'),
  formidable = require('formidable'),
  util = require('util'),
  _ = require('underscore'),
  helmet = require('helmet'),
  bodyParser = require('body-parser'),
  app = express(),
  router = express.Router()

// define port to listen on
var port = 8080;
var jsonParser = bodyParser.json()

// keep all security middleware except frameguard
// since we want display on Mturk as iframe
app.use(helmet({
  frameguard: false
}));

//tell express that public is the root of our public web folder
app.use(express.static(path.join(__dirname, 'public')));

// handle routing requests
router.use(function (req, res, next) {
  next()
})

router.post('/make_dir', jsonParser, function(req, res) {
  console.log(req.body['dir_name'])
  var dir_path = "./uploads/"+req.body['dir_name'];
  mkdirp(dir_path, function(err) {
    if (err) console.error(err)
      else console.log('created upload directory!')
  });
})

router.post('/remove_list_number', jsonParser, function (req, res) {
  console.log('removing list number')
  if (!req.body) return res.sendStatus(400)
  // write over order tracker in req.body
  var list_number = req.body['list_number'];
  //console.log(list_number);
  // read current order list tracker
  var old_order_dict = JSON.parse(fs.readFileSync('public/order_list_generator.json', 'utf8'));
  // filter the current list number out of data storage
  var new_order_array = _.filter(old_order_dict["list_number_generator"], function(num){ return num != list_number; })
  old_order_dict["list_number_generator"] = new_order_array;
  //console.log(old_order_dict["list_number_generator"] == list_number);
  var new_json =  JSON.stringify(old_order_dict);
  // rewrite order object to disk removing the current participants list number from the pool
  fs.writeFile("public/order_list_generator.json", new_json, 'utf8', function (err) {
       if (err) {return console.log(err);} console.log("The file was saved!");
   });
});

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

app.use('/', router)
app.listen(port);
