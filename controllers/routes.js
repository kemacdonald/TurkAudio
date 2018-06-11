var express = require('express'),
  fs = require('fs'),
  path = require('path'),
  mkdirp = require('mkdirp'),
  url = require('url'),
  formidable = require('formidable'),
  util = require('util'),
  helmet = require('helmet'),
  bodyParser = require('body-parser'),
  _ = require('underscore'),
  app = express(),
  router = express.Router()

var jsonParser = bodyParser.json()

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

// handle post request when user uploads audio files
router.post('/endpoint', function(req, res){
  uploadFile(req, res);
})

//handle post request when user finishes the task
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

module.exports = router

// functions for parsing the uploaded data
function uploadFile(req, res) {
    // setup form
    var form = new formidable.IncomingForm();
    var dir = !!process.platform.match(/^win/) ? '\\uploads\\' : '/uploads/';
    form.uploadDir = __dirname + dir;
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;
    form.maxFields = 1000;
    form.multiples = false;
    // change the file path to use the fileName in the uploaded data
    form.on('fileBegin', function(name, file) {
      person_dir = dir + file.name.slice(0, file.name.indexOf("_")) + '/'
      file.path = __dirname + person_dir + file.name;
      console.log("the file path is: " + file.path )
    });

    form.parse(req, function(err, fields, files) {
      var file = util.inspect(files);
      res.writeHead(200, getHeaders('Content-Type', 'application/json'));
      var fileName = file.split('name:')[1].split(',')[0].toString().replace(',', '').replace(/\s/g, '').replace(/'/g, '');
      var fileURL = 'https://' + app.address + ':' + port + '/uploads/' + fileName;
      console.log('fileURL: ', fileURL);
      res.write(JSON.stringify({
          fileURL: fileURL
      }));
      res.end();
    });
}

// utility function to get headers from http request
function getHeaders(opt, val) {
  try {
    var headers = {};
    headers["Access-Control-Allow-Origin"] = "https://secure.seedocnow.com";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";

    if (opt) {
        headers[opt] = val;
    }
    return headers;
  } catch (e) {
    return {};
  }
}
