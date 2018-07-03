// MODULE WITH FUNCTIONS FOR CONTROLLING THE FLOW OF THE EXPERIMENT
// These functions help with setting up and taking down 'slides' for the web app
var record = require('./recording.js')


// get and play example audio of an order
function play_example_audio() {
  audio = $('#example_audio')
  audio.attr('src', "media/example_order.webm");
  audio.trigger('play')
  audio.on('ended', function() {
    $('button#start_ordering').show()
  });
}

// return a random number
function random(a,b) {
  if(_.isUndefined(b)) {
    a = a || 2;
    return Math.floor(Math.random() * a);
  } else {
    return Math.floor(Math.random() * (b-a+1)) + a
  }
}

// show slide function
function showSlide(id) {
  $(".slide").hide();
  $("#"+id).show();
}

// bind start and stop recording to keyboard events
function bind_keyboard_events() {
  $(document).keyup(function(event) {
      var keys = {"left": 37, "right": 39};
       switch(event.which) {
        case keys["left"]:
          record.startRecording();
          break;
        case keys["right"]:
          if(recorder.state !== "inactive") {
            record.stopRecording();
          }
          break;
        default:
      };
    });
}

function unbind_keyboard_events() {
  console.log("unbinding keyboard events")
  $(document).off( "keyup")
}

// builds the order based on the order key and the order instructions
function init_order(app) {
  app.state.current_sentence_key = get_next_order(app);
  console.log("current order key is: " + app.state.current_sentence_key)
  if (!_.isUndefined(app.state.current_sentence_key)){advance_exp(app)};
}

// advances the experiment
function advance_exp(app) {
  var delay = 1000
  setTimeout(function(){
    build_prompt(app);
    $(".progress").progressbar("option", "value",($(".progress").progressbar( "option", "value")+1));
  }, delay);
}

// extracts the order list number from the order key
function get_list_number(order_key) {
  return order_key.substring(0,8).replace("_", "");
}

// gets the next order key from the list of order_keys
function get_next_order(app) {
  console.log(app.state.key_list)
  // if order keys is empty, we are done and end the experiment
  if( _.isEmpty(app.state.key_list) ) {
    setTimeout(function(){ exp.init_final_slide();}, 1000); // add some delay before showing final slide
  } else {
    return app.state.key_list.shift();
  }
}

// builds the html for each orderthat will be displayed to the user
function build_prompt(app) {
  // remove the order upload text
  $("#upload_text").html("");
  var sentence = app.state.sentence_dict[app.state.current_sentence_key].sentence
  $(`#sentence_text`).html('<p class="block-text">' + sentence + '</p>');
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

function init_progress_bar(app) {
  $(".progress").progressbar();
  $(".progress").progressbar( "option", "max", app.state.n_trials);
}

// export the module
module.exports = {
  random: random,
  play_example_audio: play_example_audio,
  showSlide: showSlide,
  bind_keyboard_events: bind_keyboard_events,
  unbind_keyboard_events: unbind_keyboard_events,
  init_order: init_order,
  get_list_number: get_list_number,
  advance_exp: advance_exp,
  get_next_order: get_next_order,
  get_item_html: get_item_html,
  build_item_table: build_item_table,
  init_progress_bar: init_progress_bar
};
