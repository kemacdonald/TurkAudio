// HELPERS FOR CONTROLLING THE FLOW OF THE EXPERIMENT
// These functions help with setting up and taking down 'slides' for the web app


function init_progress_bar(n_orders_in_list) {
  $(".progress").progressbar();
  $(".progress").progressbar( "option", "max", n_orders_in_list);
}

function play_example_audio(file_name) {
  audio = $('#example_audio')
  audio.attr('src', "media/"+file_name+".webm");
  audio.trigger('play')
  audio.on('ended', function() {
    if(file_name == "correct") {
      $('#incorrect_example').attr('style', 'visibility: visible') // show the incorrect example button
    } else {
      $('button#start_ordering').show()
    }
  });
}

function play_trial_audio() {
  audio = document.getElementById("trial_audio");
  wav_dir = current_order_key.split("_")[0];
  audio.src = "media/"+wav_dir+"/"+current_order_key+".wav";
  audio.onloadstart = function() {
    $('img.waveform').show()
    audio.play();
  }
  audio.onended =  function() {
    $('img.waveform').hide()
    bind_response_keys();
  };
}

function random(a,b) {
  if(_.isUndefined(b)) {
    a = a || 2;
    return Math.floor(Math.random() * a);
  } else {
    return Math.floor(Math.random() * (b-a+1)) + a
  }
}

function showSlide(id) {
  $(".slide").hide();
  $("#"+id).show();
}

function handle_response(event_type) {
  audio.pause();
  $('img.waveform').hide()
  unbind_keyboard_events();
  switch(event_type) {
    case 40:
        $("#feedback_text").html('<font color="red">' +'<b>Order was INCORRECT</b>' + '</font>');
      break;
    case 38:
        $("#feedback_text").html('<font color="green">' +'<b>Order was CORRECT</b>' + '</font>');
      break;
    case 66:
        $("#feedback_text").html('<font color="red">' +'<b>Order was SILENT</b>' + '</font>');
      break;
  }
  $('#feedback_text').show();
}

function bind_response_keys() {
  $(document).one('keyup', function(event) {
    var response_keys = {"up": 38, "down": 40, "silent": 66};
    console.log(event.which)
    switch(event.which) {
      case response_keys["down"]:
        handle_response(event.which);
        exp.order_level_data[current_order_key] = "incorrect";
        init_next_order();
        break;
      case response_keys["up"]:
        handle_response(event.which);
        exp.order_level_data[current_order_key] = "correct";
        init_next_order();
        break;
      case response_keys["silent"]:
        handle_response(event.which);
        exp.order_level_data[current_order_key] = "silent";
        init_next_order();
        break;
      default:
        unbind_keyboard_events();
        bind_audio_controller();
        bind_response_keys();
    };
  });
}

function bind_audio_controller() {
  $(document).keyup(function(event) {
      var keys = {"s": 83};
       switch(event.which) {
        case keys["s"]:
          play_trial_audio();
        default:
      };
    });
}

function unbind_keyboard_events() {
  console.log("unbinding keyboard events")
  $(document).off( "keyup")
}

// builds the order based on the order key and the order instructions
function init_next_order() {
  bind_audio_controller();
  current_order_key = get_next_order(order_keys);
  console.log("current order key is: " + current_order_key)
  if (!_.isUndefined(current_order_key)){advance_exp(current_order_key)};
}

// advances the experiment
// if we are on the first trial, zero seconds between trials
// if we are in any other trial, add 1 second delay
function advance_exp(current_order_key) {
  if (order_keys.length == n_trials - 1) {
    var delay = 0
  } else {
    $(".progress").progressbar("option", "value",($(".progress").progressbar( "option", "value")+1));
    var delay = 1000
  }
  setTimeout(function(){
    build_order_prompt(current_order_key, list_of_orders);
    $('#feedback_text').hide()
    }, delay);
}

// extracts the order list number from the order key
function get_list_number(order_key) {
  return order_key.substring(0,8).replace("_", "");
}

// gets the next order key from the list of order_keys
function get_next_order(order_keys) {
  // if order keys is empty, we are done and end the experiment
  if( _.isEmpty(order_keys) ) {
    setTimeout(function(){ exp.init_final_slide();}, 1000); // add some delay before showing final slide
  } else {
    return order_keys.shift();
  }
}

// builds the html for each orderthat will be displayed to the user
function build_order_prompt(current_order_key, list_of_orders) {
  // remove the order upload text
  $("#upload_text").html("");
  var order = list_of_orders[current_order_key];
  var thanks_text = order.pop(), please_text = order.shift();
  please_text = please_text.replace('from top to bottom', "from left to right"); // temp hack to fix prompt
  $(`#order_text`).html('<p class="block-text">' + please_text + '</p>');
  // build the table of item prompts from order
  var item_table_html = build_item_table(order);
  $(`#items_table`).html(item_table_html);
}

// cleans up the html for a single item in the order
function get_item_html(item) {
  var item_html = item.replace('Please order ', '');           // remove "please" text
  item_html = item_html.replace(/(\r\n|\n|\r)/gm, "<br><br>"); // add line breaks
  return item_html;
}

// builds the item table html
function build_item_table(order) {
  var n_cols = order.length, table_html = '<table id="items_table" border="1"><tr>';
  for (col = 0; col < n_cols; col++) {
    var item_html = get_item_html(order[col]);
    if (col == 0) {
      table_html = table_html.concat('<td>'+item_html+'</td>');
    } else {
      table_html = table_html.concat('<td>'+item_html+'</td>');
    };
  };
  table_html = table_html.concat('</tr></table>');
  return table_html
}
