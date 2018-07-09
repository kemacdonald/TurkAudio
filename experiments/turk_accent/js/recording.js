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
function onRecordingReady(e) {
  var control = require('./control')
  if(!_.isEmpty(turk.workerId)) {
    uploadBlob(e.data, e.target.app);
  } else {
    console.log('Not a turker, so no upload initiated')
  };
  // initialize the next order after the recording has been uploaded
  control.init_order(e.target.app);
}

function startRecording() {
  $(`img.waveform`).css('visibility', 'visible')
  recorder.start();
}

function stopRecording() {
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
  stopRecording: stopRecording
}
