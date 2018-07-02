//HELPER FUNCTIONS FOR CLIENT-SERVER COMMUNICATION DURING THE EXPERIMENT
var control = require('./control')

function generate_sentence_list(app) {
  $.ajax({
    dataType: "json",
    url: 'data_model/common_voices.json',
    success: function (data) {
      console.log("Successfully loaded sentence dict");
      app.config.sentence_dict = data;
      get_eval_keys_ajax(app);
      get_training_keys_ajax(app);
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

// request to get the list of orders for this turker
function get_eval_keys_ajax(app) {
  var order_url = "data_model/eval_keys.json";
  $.ajax({
    dataType: "json",
    url: order_url,
    success: function (data) {
      console.log("Successfully retrieved evaluation keys")
      app.config.eval_keys = data;
    },
    error: function(xhr, status, error) {
      var err = eval("(" + xhr.responseText + ")");
      console.log(err.Message);
    }
  });
};

// request to get the list of orders for this turker
function get_training_keys_ajax(app) {
  var order_url = "data_model/training_keys.json";
  $.ajax({
    dataType: "json",
    url: order_url,
    success: function (data) {
      console.log("Successfully training_keys evaluation keys")
      training_keys_sample = _.sample(data, app.config.n_training_trials);
      app.config.training_keys = training_keys_sample;
      app.config.n_trials = app.config.n_eval_trials + app.config.n_training_trials
    },
    error: function(xhr, status, error) {
      var err = eval("(" + xhr.responseText + ")");
      console.log(err.Message);
    }
  });
};

// request to create the directory to store audio file uploads
function create_upload_dir_ajax(turk_id) {
  var dir_name = "turker" + "_" + turk_id;
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
  setTimeout(function(){turk.submit(exp);}, 500);
}

// export the module
module.exports = {
  generate_sentence_list: generate_sentence_list,
  remove_list_number: remove_list_number_ajax,
  create_upload_dir: create_upload_dir_ajax,
  upload_audio: upload_audio_ajax,
  end_and_submit_exp: end_and_submit_exp_ajax
};
