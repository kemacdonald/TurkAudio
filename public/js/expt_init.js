// EXPERIMENT SETUP

// Key functionality is two AJAX calls that are initiated by generate_list_of_orders()
// The first generates an order number based on a json dict of possible order_lists
// The second call grabs the ordering instructions json list to display it to the turker

var n_orders_in_list = 50, prop_sample = 0.4, n_trials = Math.floor(n_orders_in_list * prop_sample)
var order_number_obj, list_number, list_of_orders, order_keys, n_trials, order_number, person_key;

// we wrap the init code in document.ready
// so that the ajax call only fires once when the page loads
$(document).ready(function(){
  generate_list_of_orders_ajax(shuffle=true, prop_sample=prop_sample);
  init_progress_bar(n_trials);
  showSlide("introduction")
});
