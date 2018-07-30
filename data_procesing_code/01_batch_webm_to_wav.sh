# convert webm video/audio files to wav format
# checks if file already exists in the wav directory so we don't duplicate effort
# puts the wav files in a separate directory

hit_id=3CZH926SIDLZ8JXWQDR70FKZV6G4EK
hit_key=${hit_id:0:5}
echo $hit_key
cd ../raw_audio
mkdir -p 01_wav_batch/$hit_id
cd 00_webm_batch/$hit_id

for file in turker*/*; do
  check_file=${file%.webm}
  break
  #echo ../../wav_batch/$hit_id/$check_file.wav
  if [ ! -f ../../wav_batch/$hit_id/$check_file.wav ]; then
    dirname=$hit_id/"$(echo $file | cut -d/ -f -1)"
    echo $dirname
    mkdir -p ../../wav_batch/$dirname
    ffmpeg -hide_banner -loglevel panic -y -i "$file" -ar 16000 -ac 1 -c:a pcm_s16le "../../wav_batch/$hit_id/${file%.webm}".wav;
    echo "file does not exist, converting to wav"
  else
    echo "$file already exists, skipping"
  fi
done
