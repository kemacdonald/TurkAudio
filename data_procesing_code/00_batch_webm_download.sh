# get webm video/audio files from AWS server
# create a webm directory if it doesn't exist
# put the webm files in the new webm dir

# note that this script relies on having a .pem file
# on your local machine that provides access to the
# turkorders AWS lightsail server ()

cd ../
mkdir -p raw_audio
cd raw_audio
mkdir -p webm_batch
cd webm_batch

rsync -avz -e "ssh -i ~/.ssh/LightsailDefaultPrivateKey-us-west-2.pem" bitnami@turkorders.com:~/stack/apps/turk_audio_app/uploads/* .
