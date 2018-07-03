// Root Turk App
var express = require('express'),
  helmet = require('helmet'),
  bodyParser = require('body-parser'),
  app = express()

// define port to listen on
var port = 8080;

// keep all security middleware except frameguard
// since we want display on Mturk as iframe
app.use(helmet({frameguard: false}));

app.use(express.static('public'));

router.post('/make_dir', jsonParser, function(req, res) {
  var dir_path = "./uploads/"+req.body['dir_name'] + "_" + req.body['turk_id'];
  mkdirp(dir_path, function(err) {
    if (err) console.error(err)
      else console.log('created upload directory!')
  });
})

router.post('/remove_list_number', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
  // write over order tracker in req.body
  list_number = JSON.stringify(req.body);

  // read current order list tracker
  var old_tracker;
  fs.readFile('public/order_lists.json', 'utf8', function (err, data) {
    if (err) throw err;
    old_tracker = JSON.parse(data);
  });

  // filter the current list number out of data storage
  new_order_obj = _.filter(old_tracker["list_number_generator"], function(num){ return num != list_number['list_number']; })

  fs.writeFile("public/order_lists_new.json", new_order_obj, 'utf8', function (err) {
      if (err) {return console.log(err);} console.log("The file was saved!");
  });
})

// //handle post request when user finishes the task
router.post('/submit', jsonParser, function (req, res) {
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

// functions for parsing the uploaded data
function uploadFile(request, response) {
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
      file.path = __dirname + dir + file.name;
    });

    form.parse(request, function(err, fields, files) {
      var file = util.inspect(files);
      response.writeHead(200, getHeaders('Content-Type', 'application/json'));
      var fileName = file.split('name:')[1].split(',')[0].toString().replace(',', '').replace(/\s/g, '').replace(/'/g, '');
      var fileURL = 'https://' + app.address + ':' + port + '/uploads/' + fileName;
      console.log('fileURL: ', fileURL);
      response.write(JSON.stringify({
          fileURL: fileURL
      }));
      response.end();
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
