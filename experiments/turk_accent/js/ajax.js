//HELPER FUNCTIONS FOR CLIENT-SERVER COMMUNICATION DURING THE EXPERIMENT
var control = require('./control_flow')

function generate_list_of_orders_ajax(app) {
  $.ajax({
    dataType: "json",
    url: 'order_list_generator.json',
    success: function (data) {
      console.log("Successfully loaded condition object");
      app.state.order_number_obj = data;
      // sample from numbers in the list generator pool
      // if the pool is empty generate random, valid order_list number
      if(!_.isEmpty(app.state.order_number_obj["list_number_generator"])) {
        console.log('sampling list number from list generator dict');
        app.state.list_number = _.sample(app.state.order_number_obj['list_number_generator'], 1).toString();
      } else {
        console.log('sampling list number randomly');
        app.state.list_number = control.random(app.config.n_orders_list_min, app.config.n_orders_list_max).toString();
      }
    get_list_of_orders_ajax(app);
    }
  });
}

// Removes current list number from the pool of possible list numbers
function remove_list_number_ajax(list_number) {
  $.ajax({
    type: "POST",
    contentType: "application/json; charset=utf-8",
    url: "turk_accent_routes/remove_list_number",
    data: JSON.stringify({list_number}),
    dataType: "json"
  });
}

//
// // request to get the list of orders for this turker
function get_list_of_orders_ajax(app) {
  var order_url = "order_lists/person" + app.state.list_number + ".json";
  $.ajax({
    dataType: "json",
    url: order_url,
    success: function (data) {
      console.log("Successfully initiated experiment")
      app.state.list_of_orders = data;
      app.state.order_keys = _.keys(app.state.list_of_orders);
      app.state.n_trials = _.size(app.state.list_of_orders)
    },
    error: function(xhr, status, error) {
      var err = eval("(" + xhr.responseText + ")");
      console.log(err.Message);
    }
  });
};

// request to create the directory to store audio file uploads
function create_upload_dir_ajax(list_number, turk_id) {
  var dir_name = "person" + list_number + "_" + turk_id;
  $.ajax({
    dataType: "json",
    type: "POST",
    url: "turk_accent_routes/make_dir",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify({"dir_name":dir_name}),
  });
}

// upload audio blob to server
function upload_audio_ajax(formData) {
  $.ajax({
    url: 'turk_accent_routes/endpoint',
    type: "POST",
    cache: false,
    data: formData,
    processData: false,
    contentType: false,
    success: function(response) {
      console.log('Successfully uploaded audio file.');
    },
    error: function(jqXHR, textStatus, errorMessage) {
      alert('Error:' + JSON.stringify(errorMessage));
    }
  });
}

function end_and_submit_exp_ajax() {
  exp.end_time = new Date();
  if(!_.isEmpty(exp.start_time)) {
    exp.completion_time = exp.end_time.getTime() - exp.start_time.getTime();
  }
  // add list number to the finished pool
  if(!_.isEmpty(turk.workerId)) {
    $.ajax({
      type: "POST",
      contentType: "application/json; charset=utf-8",
      url: "turk_accent_routes/submit",
      data: JSON.stringify({list_number}),
      dataType: "json"
    });
  }
  setTimeout(function(){turk.submit(exp);}, 500);
}

// export the module
module.exports = {
  generate_list_of_orders: generate_list_of_orders_ajax,
  remove_list_number: remove_list_number_ajax,
  create_upload_dir: create_upload_dir_ajax,
  upload_audio: upload_audio_ajax,
  end_and_submit_exp: end_and_submit_exp_ajax
};
