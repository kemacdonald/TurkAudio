//HELPER FUNCTIONS FOR CLIENT-SERVER COMMUNICATION DURING THE EXPERIMENT

// Removes current list number from the pool of possible list numbers
function remove_list_number_ajax(list_number) {
  $.ajax({
    type: "POST",
    contentType: "application/json; charset=utf-8",
    url: "remove_list_number",
    data: JSON.stringify({list_number}),
    dataType: "json"
  });
}

function generate_list_of_orders_ajax() {
  $.ajax({
    dataType: "json",
    url: 'order_list_generator.json',
    success: function (data) {
      console.log("Successfully loaded condition object");
      order_number_obj = data;
      // sample from numbers in the list generator pool
      // if the pool is empty generate random, valid order_list number
      if(!_.isEmpty(order_number_obj["list_number_generator"])) {
        console.log('sampling list number from list generator dict');
        list_number = _.sample(order_number_obj['list_number_generator'], 1).toString();
      } else {
        console.log('sampling list number randomly');
        list_number = random(n_orders_list_min, n_orders_list_max).toString();
      }
      get_list_of_orders_ajax(list_number);
    }
  });
}

// Function to make the AJAX request to get the list of orders for this turker
function get_list_of_orders_ajax(list_number) {
  var order_url = "order_lists/person" + list_number + ".json";
  $.ajax({
    dataType: "json",
    url: order_url,
    success: function (data) {
      console.log("Successfully initiated experiment")
      list_of_orders = data;
      order_keys = _.keys(list_of_orders);
      n_trials = _.size(list_of_orders)
    },
    error: function(xhr, status, error) {
      var err = eval("(" + xhr.responseText + ")");
      console.log(err.Message);
    }
  });
};

function create_upload_dir_ajax(list_number) {
  var person_key = "person"+list_number
  $.ajax({
    dataType: "json",
    type: "POST",
    url: "make_dir",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify({"dir_name":person_key,
                      "turk_id":turk.workerId}),
  });
}

// upload audio blob to server
function upload_audio_ajax(formData) {
  $.ajax({
    url: 'endpoint',
    type: "POST",
    cache: false,
    data: formData,
    processData: false,
    contentType: false,
    success: function(response) {
      console.log('Successfully uploaded.');
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
      url: "submit",
      data: JSON.stringify({list_number}),
      dataType: "json"
    });
  }
  setTimeout(function(){turk.submit(exp);}, 500);
}
