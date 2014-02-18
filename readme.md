# Tilesaw

[![Tiled Arch, Artist Unknown, Pakistan, 18th
century](./tiles.jpg)](https://collections.artsmia.org/index.php?page=detail&id=99789)

Builds off @jcupitt's [libvips](//github.com/jcupitt/libvips) and
[mapbox/mbutil](//github.com/mapbox/mbutil) to cut images
into map tiles.

## Components

### tilesaw.sh

A shell script for cutting a large image into "map" tiles suitable for
leaflet. It uses `vips` for the tiling, `exiftool` to ensure `{width: …,
height: …}` exist in the resulting `metadata.json`, and `mb-util` to
package the tiles as `.mbtiles`.

I've built my own
[`vips`](https://github.com/kjell/libvips/tree/dzsave-zxy-no-padding)
that tiles images `(z/x/y)` (instead of `(z/y/x)`) and doesn't pad
non-square tiles.

### index.js

An `express.js` app that brokers (a) serving and (b) downloading and
tiling new images, to then be served.

The tilesaw server has two methods:

* `/`: list all available, tiled images
* `/:image`: return `tileJson` for `:image`. If the image hasn't been
  tiled yet, attempt to retrieve it and process it into tiles.

* [`tilestream`][] serves tiles that have already been converted
* `index.js` (`index.example.js` for a stub implementation) takes the
  name of an image and checks whether it's been tiled yet. If it has
  (indicated by an affirmative response from `tilestream`, serve the
  [`tilejson`][] for that image. If not, it attemts to download the
  full-res image and tile it.

The app uses 'adapters' to find images to tile. Two example adapters are
provided: `noop` and `directory`. When `tilesaw` can't find tiles for an
image, it will try each adapter to find a suitable image. If the adapter
succeeds, it's responsible for tiling the image and indicating its
success. If not, the next adapter gets a try.

* `adapters/noop.js` doesn't do anything. It logs a message to the
  console and returns an error.
* `adapters/directory.js` checks for a matching image in a predetermined
  directory. If one exists, it's tiled and passed back to the client.

If all the listed adapters fail, `tilesaw` will return a `404`.

## Installation

### Ubuntu, by hand

It's not too touch to install by hand, but you have to know what you're
doing.

First, install vips:

```
sudo apt-get update
sudo apt-get install build-essential gettext-base libglib2.0-dev libxml2-dev pkg-config pkg-config swig gtk-doc-tools automake gobject-introspection make libtiff-dev libjpeg-dev libpng-dev libexif-dev
git clone http://github.com/kjell/libvips.git
cd libvips
git checkout dzsave-zxy-no-padding
./bootstrap.sh
autoconf
./configure
make
sudo make install
export LD_LIBRARY_PATH=/usr/local/lib
```

vips should be working. Test it with `vips --version`.

Next, install nodejs and python:

``
sudo apt-get install python-software-properties python python-setuptools g++ make
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install libsqlite3-dev nodejs-dev npm libimage-exiftool-perl
```

Finally, install `mb-util` and `tilesaw`.

```
git clone https://github.com/mapbox/mbutil /tmp/mbutil
cd /tmp/mbutil
sudo python setup.py install

git clone https://github.com/artsmia/tilesaw /tmp/tilesaw
cd /tmp/tilesaw
npm install
```

Now you can start tilesaw (`npm start`).

By default runs on port 8887, with tilestream on 8888. To run it you'll
need to set a few environment variables:

```
PORT # 8887
IMAGEDIRECTORY # the directory to look for untiled images
TILEDIR # Where to put the tiles
TILESAW # Where is the tilesaw script?
```

### Docker

So far the nodejs parts are should be easily replicable using Docker. If
that's not your thing, the `Dockerfile` lays out what needs to happen to
make everything work.

The vips installation isn't covered yet, that's coming soon.

## Domain name

Then these servers should be reverse proxied by `nginx` to a subdomain.
We're using `tilesaw.dx.artsmia.org` and `tiles.dx.artsmia.org`.

[`vips`]: https://github.com/kjell/libvips/commits/dzsave-zxy-no-padding
[`tilestream`]: https://github.com/mapbox/tilestream
[`tilejson`]: https://github.com/mapbox/tilejson-spec
