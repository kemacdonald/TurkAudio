# wraps each turker's audio files up in a tarball for
# uploading to S3 storage

hit_id=3CZH926SIDLZ8JXWQDR70FKZV6G4EK

cd ../raw_audio/
mkdir -p wav_tarballs/$hit_id
cd wav_batch_clean/$hit_id

# loop this over the directories
# create tarballs for each
for dir in */ ; do
    tar -cvzf "../../wav_tarballs/$hit_id/${dir%/}".tar.gz "$dir"
done
