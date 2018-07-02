"""
Short script to generate list assignments
data structure for turk comprehension data collection.
The goal is to ensure that we have a one-to-one
mapping of audio files to turkers.
"""

import json
import os
import re
import random

def file_read_from_head(fname, nlines):
  from itertools import islice
  with open(fname) as f:
    head = list(islice(f, nlines))
  return head

def txt_to_dict(raw_text, n_items_eval = 100):
  eval_pool = ['evaluation'] * n_items_eval
  d_dict = {}
  training_keys = []
  eval_keys = []
  # split the key from the sentence
  d = [i.split(',', 1) for i in raw_text]
  random.shuffle(d)
  ## build the dictionary and training/eval key lists
  for sub_list in d:
    # clean up the key string
    sub_list[0] = sub_list[0].replace("cv-valid-train/sample-", "").replace(".mp3", "")
    if not eval_pool:
      sub_list.append('training')
      training_keys.append(sub_list[0])
    else:
      flip = random.randint(0, 1)
      if flip == 1:
        sub_list.append(eval_pool.pop())
        eval_keys.append(sub_list[0])
      else:
        sub_list.append('training')
        training_keys.append(sub_list[0])
    # add to dict
    d_dict[sub_list[0]] = {'sentence': sub_list[1], 'sentence_type': sub_list[2]}
  return d_dict, eval_keys, training_keys

## read and build data dictionary, evaluation keys, and training training_keys
random.seed(7)
d_txt = file_read_from_head('commonvoice_sentences.txt', nlines = 1000)
d_dict, eval_keys, training_keys = txt_to_dict(d_txt, n_items_eval = 100)

## save the structured data as json
with open('common_voices.json', 'w') as outfile:
  json.dump(d_dict, outfile)

with open('training_keys.json', 'w') as outfile:
  json.dump(training_keys, outfile)

with open('eval_keys.json', 'w') as outfile:
  json.dump(eval_keys, outfile)

print("All data model files were successfully generated")
