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
    turker_id: turk.workerId,
    browser: browser.name,
    browser_height: $(window).height(),
    browser_width: $(window).width(),
    screen_width: screen.width,
    screen_height: screen.height,
    mobile_device: /Mobi/.test(navigator.userAgent),
    ip: app.ip,
    webrtc: DetectRTC,
    sentence_dict: app.state.sentence_dict,
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
      } else if (DetectRTC.isWebRTCSupported === false || DetectRTC.hasMicrophone === false) {
        alert("This HIT will only work on computers/browsers with a working microphone. Please switch if you would like to accept this HIT. Thanks!");
          control.showSlide("introduction");
      } else {
        ajax.create_upload_dir(turk.workerId, app.state.hit_id);
        exp.start_time = new Date();
        $('button#start_ordering').hide()
        control.showSlide('instructions')
      }
    },
    init_order_slide: function() {
      control.init_progress_bar(app);
      control.clean_trial_slide();
      control.bind_keyboard_events();
      control.init_order(app);
      record.init_audio_recording(app);
    },
    init_final_slide: function() {
      control.unbind_keyboard_events();
      control.showSlide('final_questions');
    },
    check_final_slide: function() {
      var language = document.getElementById("language").value,
          country = document.getElementById("country").value,
          state = document.getElementById("state").value,
          other_langs = document.getElementById("other_languages").value;
      if (_.isEmpty(language) || _.isEmpty(country) || _.isEmpty(state) || _.isEmpty(other_langs)) {
        $("#checkMessage").html('<font color="red">' + '<b>Please make sure you have answered all of the questions. Thank you!</b>' + '</font>');
      } else {
        console.log('all necessary fields entered, ending HIT')
        exp.first_language = language;
        exp.country = country;
        exp.us_state = state;
        exp.age_exposure_eng = document.getElementById("age_exposure").value;
        exp.other_langs = other_langs;
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
