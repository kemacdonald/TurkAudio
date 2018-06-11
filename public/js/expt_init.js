// EXPERIMENT SETUP

// Key functionality is two AJAX calls that are initiated by generate_list_of_orders()
// The first generates an order number based on a json dict of possible order_lists
// The second call grabs the ordering instructions json list to display it to the turker

var n_orders_in_list = 50, n_orders_list_min = 20, n_orders_list_max = 80;
var order_number_obj, list_number, list_of_orders,
  order_keys, n_trials, order_number, person_key;

// we wrap the init code in document.ready
// so that the ajax call only fires once when the page loads
$(document).ready(function(){
  generate_list_of_orders();
  // Initialize progress bar and show the first slide of the experiment
  $(".progress").progressbar();
  $(".progress").progressbar( "option", "max", n_orders_in_list);
  // Show the first slide
  showSlide("introduction")
});
