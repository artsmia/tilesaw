#!/usr/bin/env bash
# NEEDS: vips, mb-util, exiftool

image=$1

if [ ! -f $image ]; then
  echo "$image does not exist."
  exit 1
fi

name="${image%.*}"
extension="${image##*.}"

tile_dir=tiles/$name
mkdir -p $tile_dir
rm -rf $tile_dir # make sure tiles/ exists, clear tiles/$name if that exists

vips dzsave $image $tile_dir --layout=google

metadata="{ \"name\": \"$name\",
  \"width\": \"$(exiftool $image | grep Width | cut -d ':' -f2 | tr -d ' ')\",
  \"height\": \"$(exiftool $image | grep Height | cut -d ':' -f2 | tr -d ' ')\"
}"
echo $metadata > $tile_dir/metadata.json

mb-util $tile_dir/ $name.mbtiles --image_format=$extension
