"""
Build the data model for the turk accent data collection
experiment. The data structure is a dictionary of key-value pairs.
The keys are taken from commonvoice dataset.
The values are the sentences that turkers read.
"""

import json
import os
import re
import random
import csv

def file_read_from_head(fname, nlines):
  from itertools import islice
  with open(fname) as f:
    head = list(islice(f, nlines))
  return head

def subset_sentence_dict(d, min_l = 5, max_l = 20):
  """
  Filter dict to contain sentences of certain length
  """
  return {k:v for (k,v) in d_dict.items() if len(v['sentence'].split()) >= min_l and
    len(v['sentence'].split()) <= max_l}

def txt_to_dict(raw_text, n_items_eval = 0):
  """
  Convert commonvoice txt file to json dictionary.
  """
  eval_pool = ['evaluation'] * n_items_eval
  d_dict = {}
  training_keys = []
  eval_keys = []
  # split the key from the sentence and shuffle key order
  d = [i.split(',', 1) for i in raw_text]
  random.shuffle(d)
  # build the dictionary and training/eval key lists
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
    d_dict[sub_list[0]] = {'sentence': sub_list[1].rstrip(), 'sentence_type': sub_list[2]}
  return d_dict, training_keys

# read and build data dictionary, evaluation keys, and training training_keys
random.seed(7)
eval_dict = {}
with open('turk_eval_sentences.tsv') as tsvfile:
  reader = csv.reader(tsvfile, delimiter='\t')
  for row in reader:
    eval_sentence = row[0].split('  ')
    eval_dict[eval_sentence[0]] = {'sentence': eval_sentence[1].lower(),
                                 'sentence_type': 'evaluation'}
eval_keys = list(eval_dict.keys())
# Read training keys and sentences from commonvoice dataset
d_txt = file_read_from_head('commonvoice_sentences.txt', nlines = 190000)
d_dict, training_keys = txt_to_dict(d_txt, n_items_eval = 0)
# Merge the training and eval dictionaries
d_dict.update(eval_dict)

## save the data structure as json
with open('common_voices.json', 'w') as outfile:
  json.dump(d_dict, outfile)

with open('training_keys.json', 'w') as outfile:
  json.dump(training_keys, outfile)

with open('eval_keys.json', 'w') as outfile:
  json.dump(eval_keys, outfile)

print("All data model files were successfully generated")
