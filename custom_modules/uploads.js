// tiny module for parsing the uploaded audio files
var formidable = require('formidable'),
  path = require('path'),
  util = require('util');

exports.uploadFile = function(req, res) {
  // setup form
  var form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.maxFieldsSize = 10 * 1024 * 1024;
  form.maxFields = 1000;
  form.multiples = false;
  // parse data
  form.parse(req);
  // save to server
  form.on('fileBegin', function(name, file) {
    // TODO: figure out how to get turk_id into file name
    //var turk_id = "_" + file.name.split("_")[4];
    var person_dir = file.name.slice(0, file.name.indexOf("_")) + '_/'
    file.path = './uploads/' + person_dir + file.name;
    res.end();
  });
}
