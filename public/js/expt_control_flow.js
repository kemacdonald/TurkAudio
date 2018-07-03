// EXPERIMENT CONTROL FLOW

// Initialize the RTC detector for checking if user has working mic
DetectRTC.load(onRTCready);

// When the RTC is ready initialize the exp object
// This object stores the experiment metadata and controls
// the flow of the task
function onRTCready() {
  exp = {
    browser: BrowserDetect.browser,
    browser_height: $(window).height(),
    browser_width: $(window).width(),
    audio_input_devices: DetectRTC.audioInputDevices,
    audio_output_devices: DetectRTC.audioOutputDevices,
    screen_width: screen.width,
    screen_height: screen.height,
    mobile_device: /Mobi/.test(navigator.userAgent),
    order_id: "",
    first_language: "",
    age_exposure_eng: "",
    years_eng: "",
    other_langs: "",
    comment: "",
    age: "",
    gender: "",
    start_time: "",
    end_time: "",
    completion_time: "",
    // init the intro slide
    init_task_intro: function() {
      if(turk.previewMode) {
        alert("Please accept the HIT to view")
        showSlide('introduction')
      } else {
        exp.order_id = get_list_number(order_keys[0])
        if (!DetectRTC.isWebRTCSupported) {
          showSlide("instructions");
          alert("This HIT will only work on computers/browsers with a working microphone. Please switch if you would like to accept this HIT. Thanks!");
        } else {
          exp.start_time = new Date();
          if(!_.isEmpty(turk.workerId)) {
            remove_list_number_ajax(list_number); // remove the order list from the pool
          }
          // hide the start ordering button until they listen to the example
          $('button#start_ordering').hide()
          showSlide('instructions')
        }
      }
    },
    // init the ordering slide
    init_order_slide: function() {
      $('#example_audio').trigger('pause'); // pause any audio that might still be playing
      $(".progress").attr("style", "visibility: visible"); // make the progress bar visible
      if(!_.isEmpty(turk.workerId) & !turk.previewMode){
        create_upload_dir_ajax(list_number); // create an upload directory if this is a turker
      }
      init_order(); // creates an order (see expt_helpers.js)
      bind_keyboard_events(); // binds the left and right arrows to control the recorder
      init_audio_recording(); // note that this function also starts the experiment once the recorder objects has been created
    },

    init_final_slide: function() {
      unbind_keyboard_events();
      showSlide('final_questions');
    },

    check_final_slide: function() {
      if (_.isEmpty($("#language").val())) {
        console.log('error')
        $("#checkMessage").html('<font color="red">' + '<b>Please make sure you have answered all of the questions. Thank you!</b>' + '</font>');
      } else {
        console.log('all necessary fields entered, ending HIT')
        exp.first_language = document.getElementById("language").value;
        exp.years_eng = document.getElementById("years_english").value;
        exp.age_exposure_eng = document.getElementById("age_exposure").value;
        exp.other_langs = document.getElementById("other_languages").value;
        exp.comment = document.getElementById("comments").value;
        exp.age = document.getElementById("age").value;
        exp.gender = document.getElementById("gender").value;
        showSlide("finished");
        end_and_submit_exp_ajax(); // send data to server
      }
    }
  };
};
