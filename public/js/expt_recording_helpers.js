// HELPER FUNCTIONS FOR RECORDING AUDIO ON AMT

// construct the audio file name that gets uploaded to AWS
function make_file_name(current_order_key) {
  return current_order_key.concat('_'+ turk.workerId +'.webm');
}

// get audio stream from user's mic using WebRTC API
function init_audio_recording() {
  navigator.mediaDevices.getUserMedia({audio: true}).then(function (stream) {
    recorder = new MediaRecorder(stream);
    // listen to dataavailable, which gets triggered whenever we have an audio blob available
    recorder.addEventListener('dataavailable', onRecordingReady);
    setTimeout(function(){showSlide('order_slide');}, 1000);
  });
}

// what to do once recording is ready
function onRecordingReady(e) {
  if(!_.isEmpty(turk.workerId)) {
    uploadBlob(e.data);
  } else {
    console.log('Not a turker, so no upload initiated')
  };
  // initialize the next order after the recording has been uploaded
  init_order();
}

function startRecording() {
  $(`img.waveform`).css('visibility', 'visible')
  recorder.start();
}

function stopRecording() {
  $(`img.waveform`).css('visibility', 'hidden')
  $("#upload_text").html('<font color="green">' +'<b>Upload successful</b>' + '</font>');
  // Stopping the recorder will eventually trigger the `dataavailable`
  // event and we can complete the recording process
  recorder.stop();
}

// upload audio to AWS
function uploadBlob(blob) {
  console.log("order key in upload function is: " + current_order_key)
  var formData = new FormData();
  var fileName = make_file_name(current_order_key);
  var fileObject = new File([blob], fileName, {
      type: 'video/webm'
  });
  formData.append('video-blob', fileObject);
  formData.append('video-filename', fileObject.name);
  // send the form to the server
  upload_audio_ajax(formData);
}
