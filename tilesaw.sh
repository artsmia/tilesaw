#!/usr/bin/env bash
# NEEDS: vips, mb-util, exiftool

image=$1

if [ ! -f "$image" ]; then
  echo "$image does not exist."
  exit 1
fi

name="${image%.*}" # http://stackoverflow.com/questions/965053/extract-filename-and-extension-in-bash
extension="${image##*.}" # bash black magic

tile_dir=tiles/"$name"
mkdir -p "$tile_dir"
rm -rf "$tile_dir" # make sure tiles/ exists, then clear tiles/$name

vips dzsave "$image" "$tile_dir" --layout=google || { echo 'vips failed'; exit 1; }

metadata="{ \"name\": \"$(basename ${name})\",
  \"width\": \"$(exiftool "$image" | grep Width | head -1 | cut -d ':' -f2 | tr -d ' ')\",
  \"height\": \"$(exiftool "$image" | grep Height | head -1 | cut -d ':' -f2 | tr -d ' ')\",
  \"objectId\": \"$(exiftool "$image" | grep Transmission | head -1 | tr -d 'Transmission Reference          :')\",
  \"tiles\": [\"http://0.tiles.dx.artsmia.org/$(basename ${name})/{z}/{x}/{y}.jpg\"]
}"
echo $metadata > "$tile_dir/metadata.json"

mb-util "$tile_dir/" "$name".mbtiles --image_format=jpg 2> /dev/null
echo
