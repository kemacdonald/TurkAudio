// APP Config
var app = {
  config: {n_eval_trials: 5,
    n_training_trials: 5,
  },
  state: {
    n_trials: "",
    training_keys: "",
    eval_keys: "",
    sentence_dict: "",
    key_list: "",
    current_sentence_key: "",
    current_sentence_key_type: ""
  }
}

module.exports = app
