# Tilesaw

Builds off @jcupitt's [libvips](//github.com/jcupitt/libvips) and
[mapbox/mbutil](//github.com/mapbox/mbutil) to cut images
into map tiles.

## Components

### tilesaw.sh

A shell script for cutting a large image into "map" tiles suitable for
leaflet. It uses `vips` for the tiling, `exiftool` to ensure `{width: …,
height: …}` exist in the resulting `metadata.json`, and `mb-util` to
package the tiles as `.mbtiles`.

I've built my own [`vips`][] that tiles images `(z/x/y)` (instead of
`(z/y/x)`) and doesn't pad non-square tiles.

### index.js

An `express.js` app that brokers (a) serving and (b) downloading and
tiling new images, to then be served.

* [`tilestream`][] serves tiles that have already been converted
* `index.js` (`index.example.js` for a stub implementation) takes the
  name of an image and checks whether it's been tiled yet. If it has
  (indicated by an affirmative response from `tilestream`, serve the
  [`tilejson`][] for that image. If not, it attemts to download the
  full-res image and tile it.

## Installation

So far the nodejs parts are should be easily replicable using Docker. If
that's not your thing, the `Dockerfile` lays out what needs to happen to
make everything work.

The vips installation isn't covered yet, that's coming soon.

Then these servers should be reverse proxied by `nginx` to a subdomain.
We're using `tilesaw.dx.artsmia.org` and `tiles.dx.artsmia.org`.

[`vips`]: https://github.com/kjell/libvips/commits/dzsave-zxy-no-padding
[`tilestream`]: https://github.com/mapbox/tilestream
[`tilejson`]: https://github.com/mapbox/tilejson-spec
