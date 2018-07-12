# checks whether a directory has more than some
# number of audio files (i.e., did the turker finish the task)
# if it does, then move it to a "clean" directory for further
# processing

hit_id=3CZH926SIDLZ8JXWQDR70FKZV6G4EK

cd ../raw_audio
mkdir -p wav_batch_clean/$hit_id

for dir in wav_batch/$hit_id/* ; do
  files=("$dir"/*)
  if [ ${#files[@]} -ge 8 ]; then
    echo "$dir has more than 8 wav files, moving to clean directory"
    mv $dir wav_batch_clean/$hit_id
  else
    echo "$dir has fewer than 8 files in it, skipping"
  fi
done
