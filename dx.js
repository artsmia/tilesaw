var json = require('./dx_json'),
    _u = require('underscore')._,
    _ = require('underscore')._

module.exports = dx = {
  images: _.flatten(_.reduce(json, function(memo, _images) {
    memo.push(_images)
    return memo
  }, [])),

  byName: function(name) {
    return _.find(this.images, function(image_json) {
      return image_json.image.match(name)
    })
  },

  maxDimension: function(name) {
    json = this.byName(name)
    md = Math.max(json.max_width, json.max_height)
    return md
  }
}
