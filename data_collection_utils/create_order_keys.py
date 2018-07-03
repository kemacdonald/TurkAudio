"""
Short script to generate order keys based on the presence
of .wav files for that turker. The goal is to ensure that we
have an audio file for each order that appears in the comprehension
experiment.
"""

import json
import os
import re

person_dir = '../public/media/'
person_dirs = [ name for name in os.listdir(person_dir) if os.path.isdir(os.path.join(person_dir, name)) ]

order_key_dict = {}

for dir in person_dirs:
  order_keys = [ name.replace(".wav", "") for name in os.listdir(person_dir+ dir) if '.wav' in name ]
  order_key_dict[dir] = order_keys

with open('../public/order_keys_comprehension.json', 'w') as outfile:
    json.dump(order_key_dict, outfile)

print('Order keys dictionary created.')
