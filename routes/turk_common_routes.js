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
      // check if upload directory exists, and if not create it including the parent hit_id directory
      console.log('the directory ' + upload_dir_path + ' exists:', isDirSync(upload_dir_path));
      if (!isDirSync(upload_dir_path)) {
        console.log(upload_dir_path + ' did not exist, creating now')
        fs.mkdirSync(path.join('uploads', hit_id));
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

  //export this router to use in our main turk_app.js
  module.exports = router;
