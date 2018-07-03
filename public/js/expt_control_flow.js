// EXPERIMENT CONTROL FLOW

// This object stores the experiment metadata and controls
// the flow of the task
exp = {
  browser: BrowserDetect.browser,
  browser_height: $(window).height(),
  browser_width: $(window).width(),
  screen_width: screen.width,
  screen_height: screen.height,
  mobile_device: /Mobi/.test(navigator.userAgent),
  order_id: "",
  error_types: "",
  comment: "",
  age: "",
  gender: "",
  start_time: "",
  end_time: "",
  completion_time: "",
  order_level_data: {},

  init_task_intro: function() {
    if(turk.previewMode) {
      alert("Please accept the HIT to view")
      showSlide('introduction')
    } else {
      exp.order_id = get_list_number(order_keys[0])
      exp.start_time = new Date();
      $('button#start_ordering').hide()  // hide the start ordering button until they listen to the example
      $('#incorrect_example').attr('style', 'visibility: hidden') // hide the incorrect example button
      showSlide('instructions')
    }
  },

  init_order_slide: function() {
    $('img.waveform').hide()
    $('#example_audio').trigger('pause'); // pause any audio that might still be playing
    $(".progress").attr("style", "visibility: visible"); // make the progress bar visible
    if(!_.isEmpty(turk.workerId) & !turk.previewMode){
      remove_list_number_ajax(list_number); // if this is a valid turker remove the oreder list from the pool
    }
    init_next_order(); // gets an order to display (see expt_helpers.js)
    showSlide('order_slide'); // displays the order slide
  },

  init_final_slide: function() {
    unbind_keyboard_events();
    showSlide('final_questions');
  },

  check_final_slide: function() {
    if (_.isEmpty($("#error_types").val())) {
      console.log('error')
      $("#checkMessage").html('<font color="red">' + '<b>Please make sure you have answered all of the questions. Thank you!</b>' + '</font>');
    } else {
      console.log('all necessary fields entered, ending HIT')
      exp.error_types = document.getElementById("error_types").value;
      exp.comment = document.getElementById("comments").value;
      exp.age = document.getElementById("age").value;
      exp.gender = document.getElementById("gender").value;
      showSlide("finished");
      end_and_submit_exp_ajax(); // send data to server
    }
  }
};
