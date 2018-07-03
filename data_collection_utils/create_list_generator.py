'''
Short script to generate list assignments
data structure for turk comprehension data collection.
The goal is to ensure that we have a one-to-one
mapping of audio files to turkers.
'''
import json
import os
import re

dir = '../public/media'
person_dirs = [ name for name in os.listdir(dir) if os.path.isdir(os.path.join(dir, name)) ]
list_generator = [dir.replace("person", "") for dir in person_dirs]

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
