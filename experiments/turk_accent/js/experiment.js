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
    screen_width: screen.width,
    screen_height: screen.height,
    mobile_device: /Mobi/.test(navigator.userAgent),
    ip: app.ip,
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
    init_order_slide: function() {
      control.init_progress_bar(app);
      $('#example_audio').trigger('pause');
      $(".progress").attr("style", "visibility: visible");
      ajax.create_upload_dir(turk.workerId);
      control.init_order(app);
      control.bind_keyboard_events();
      record.init_audio_recording(app);
    },
    init_final_slide: function() {
      control.unbind_keyboard_events();
      control.showSlide('final_questions');
    },

    check_final_slide: function() {
      if ( _.isEmpty($("#language").val()) || _.isEmpty($("#country").val()) || _.isEmpty($("#us_state").val()) ) {
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
        ajax.end_and_submit_exp();
      }
    }
  };
};

module.exports = {
  onRTCready: onRTCready
}
