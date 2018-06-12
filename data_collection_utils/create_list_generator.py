'''
Short python script to generate list assignments
data structure for turk audio data collection.
The goal is to ensure that we have a one-to-one
mapping of order_lists to participants.
'''
import json

n_orders_start = 20
n_orders_end = 80
list_generator = list(range(n_orders_start+1, n_orders_end+1))

list_generator_dict = {
  'list_number_generator': list_generator,
  'list_number_finisher': []
}

# create a gold file that we don't touch
with open('../public/order_list_generator_gold.json', 'w') as outfile:
    json.dump(list_generator_dict, outfile)

# create the actual order list dict that will get updated
# as data comes in
with open('../public/order_list_generator.json', 'w') as outfile:
    json.dump(list_generator_dict, outfile)

print('List of orders created.')
