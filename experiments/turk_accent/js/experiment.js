// EXPERIMENT CONTROL FLOW
var DetectRTC = require('detectrtc'),
  control = require('./control'),
  browser = require('./browserCheck'),
  ajax = require('./ajax'),
  record = require('./recording.js')

// When the RTC is ready initialize the exp object
// This object stores the experiment metadata and controls
// the flow of the task
function onRTCready(app, turk) {
  exp = {
    browser: browser.name,
    browser_height: $(window).height(),
    browser_width: $(window).width(),
    audio_input_devices: DetectRTC.audioInputDevices,
    audio_output_devices: DetectRTC.audioOutputDevices,
    screen_width: screen.width,
    screen_height: screen.height,
    mobile_device: /Mobi/.test(navigator.userAgent),
    first_language: "",
    age_exposure_eng: "",
    country: "",
    us_state:"",
    other_langs: "",
    comment: "",
    age: "",
    gender: "",
    start_time: "",
    end_time: "",
    completion_time: "",

    play_example_audio: function() {
      control.play_example_audio();
    },
    // init the intro slide
    init_task_intro: function() {
      if(turk.previewMode) {
        alert("Please accept the HIT to view")
        control.showSlide('introduction')
      } else {
        if (!DetectRTC.isWebRTCSupported) {
          control.showSlide("instructions");
          alert("This HIT will only work on computers/browsers with a working microphone. Please switch if you would like to accept this HIT. Thanks!");
        } else {
          exp.start_time = new Date();
          // hide the start ordering button until they listen to the example
          $('button#start_ordering').hide()
          control.showSlide('instructions')
        }
      }
    },
    config_keylist: function(app) {
      app.state.key_list = app.config.training_keys + app.config.eval_keys;
      app.state.key_list = app.state.key_list.split(",")
      _.shuffle(app.state.key_list)
    },
    // init the ordering slide
    init_order_slide: function() {
      control.init_progress_bar(app)
      exp.config_keylist(app);
      $('#example_audio').trigger('pause'); // pause any audio that might still be playing
      $(".progress").attr("style", "visibility: visible"); // make the progress bar visible
      // if(!_.isEmpty(turk.workerId) & !turk.previewMode){
      //   create_upload_dir_ajax(list_number, turk.workerId) ; // create an upload directory if this is a turker
      //   remove_list_number_ajax(list_number); // remove the oreder list from the pool
      // }
      ajax.create_upload_dir(turk.workerId) ; // create an upload directory if this is a turker
      control.init_order(app); // creates an order (see expt_helpers.js)
      control.bind_keyboard_events(); // binds the left and right arrows to control the recorder
      record.init_audio_recording(app); // note that this function also starts the experiment once the recorder objects has been created
    },

    init_final_slide: function() {
      control.unbind_keyboard_events();
      control.showSlide('final_questions');
    },

    check_final_slide: function() {
      if (_.isEmpty($("#language").val())) {
        $("#checkMessage").html('<font color="red">' + '<b>Please make sure you have answered all of the questions. Thank you!</b>' + '</font>');
      } else {
        console.log('all necessary fields entered, ending HIT')
        exp.first_language = document.getElementById("language").value;
        exp.country = document.getElementById("country").value;
        exp.us_state = document.getElementById("us_state").value;
        exp.age_exposure_eng = document.getElementById("age_exposure").value;
        exp.other_langs = document.getElementById("other_languages").value;
        exp.comment = document.getElementById("comments").value;
        exp.age = document.getElementById("age").value;
        exp.gender = document.getElementById("gender").value;
        control.showSlide("finished");
        ajax.end_and_submit_exp(); // send data to server
      }
    }
  };
};

module.exports = {
  onRTCready: onRTCready
}
