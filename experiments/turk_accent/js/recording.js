// MODULE WITH FUNCTIONS FOR RECORDING AUDIO ON AMT

// get audio stream from user's mic using WebRTC API
function init_audio_recording(app) {
  var control = require('./control')
  navigator.mediaDevices.getUserMedia({audio: true}).then(function (stream) {
    recorder = new MediaRecorder(stream);
    recorder.addEventListener('dataavailable', onRecordingReady);
    recorder.app = app;
    setTimeout(function(){control.showSlide('order_slide');}, 1000);
  });
}

// what to do once recording is ready
// note the branching logic
// if its not a turker, don't upload audio file
// if the user chose to restart recording, we don't upload
// and we reset the recorder
function onRecordingReady(e) {
  var control = require('./control')
  if(_.isEmpty(turk.workerId)) {
    console.log('Not a turker, so no upload initiated')
    if(e.target.event_type == "restart") {
      $("#upload_text").html('<font color="green">' +'<b>Restarting Recording</b>' + '</font>');
      console.log('Restarting recording')
      $(`img.waveform`).css('visibility', 'hidden')
      setTimeout(function(){
        $(`img.waveform`).css('visibility', 'visible')
        $("#upload_text").html("");
        recorder.start();
      }, 1000);
    } else if (e.target.event_type == "stop_and_upload") {
      console.log('Stopped recording and advancing task')
      setTimeout(function(){control.init_order(e.target.app)},200);
    }
    //else if (e.target.event_type == "playback") {
    //   console.log("replaying last recording");
    //   var audio = $('#playback_audio')
    //   console.log(e.data)
    //   var audioURL = window.URL.createObjectURL(e.data);
    //   audio.src = audioURL;
    // }
  } else {
    if(e.target.event_type == "restart") {
      $("#upload_text").html('<font color="green">' +'<b>Restarting Recording</b>' + '</font>');
      console.log('Restarting recording')
      $(`img.waveform`).css('visibility', 'hidden')
      setTimeout(function(){
        $(`img.waveform`).css('visibility', 'visible')
        $("#upload_text").html("");
        recorder.start();
      }, 1000);
    } else if (e.target.event_type == "stop_and_upload") {
      uploadBlob(e.data, e.target.app);
      setTimeout(function(){control.init_order(e.target.app)},200);
    }
  }
}

function startRecording() {
  $(`img.waveform`).css('visibility', 'visible')
  recorder.start();
}

function restartRecording() {
  recorder.event_type = "restart";
  recorder.stop()
}

function playbackRecording() {
  recorder.event_type = "playback";
  recorder.stop()
}

function stopRecording() {
  recorder.event_type = "stop_and_upload";
  $(`img.waveform`).css('visibility', 'hidden')
  $("#upload_text").html('<font color="green">' +'<b>Upload successful</b>' + '</font>');
  recorder.stop();
}

// construct the audio file name that gets uploaded to AWS
function make_file_name(current_key) {
  return current_key.concat('_'+ turk.workerId +'.webm');
}

// upload audio to AWS
function uploadBlob(blob, app) {
  console.log("order key in upload function is: " + app.state.current_sentence_key)
  var ajax = require('./ajax')
  var formData = new FormData();
  var fileName = make_file_name(app.state.current_sentence_key);
  var fileObject = new File([blob], fileName, {
      type: 'video/webm'
  });
  formData.append('video-blob', fileObject);
  formData.append('video-filename', fileObject.name);
  ajax.upload_audio(formData);
}

module.exports = {
  init_audio_recording: init_audio_recording,
  startRecording: startRecording,
  stopRecording: stopRecording,
  restartRecording: restartRecording,
  playbackRecording: playbackRecording
}
