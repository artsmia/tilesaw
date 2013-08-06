var json = require('./dx_json'),
    _u = require('underscore')._,
    _ = require('underscore')._

module.exports = dx = {
  images: function() {
    return _.flatten(_.reduce(json, function(memo, _images, id) {
      memo.push(_images)
      return memo
    }))
  },

  byName: function(name) {
    return _.find(this.images(), function(image_json) {
      return image_json.image.match(name)
    })
  },

  maxDimension: function(name) {
    json = this.byName(name)
    md = Math.max(json.max_width, json.max_height)
    console.log('maxD', md)
    return md
  }
}
